const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFileToCloud, useS3, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');
const multer = require('multer');

// Configure memory storage for Cloudinary
const memoryStorage = multer.memoryStorage();

// Debug: Log configuration
console.log('Pitch submissions route loaded');
console.log('useCloudinary:', useCloudinary);
console.log('useS3:', useS3);

// Configure upload for pitch submissions with Cloudinary support
const upload = useCloudinary 
  ? multer({ storage: memoryStorage, limits: { fileSize: 10 * 1024 * 1024 } }).single('article_attachment')
  : uploadSingle('article_attachment', 'pitches', 10 * 1024 * 1024); // 10MB limit for pitch documents

console.log('Upload middleware configured');

// Get all pitch submissions (editor+)
router.get('/', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pitch_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy route to serve pitch attachments (handles both local and S3 URLs)
// NOTE: This route must come before /:id to avoid route conflicts
// No authentication required - attachments should be publicly viewable
router.get('/attachment/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');

    // Check if it's a local file
    const localPath = path.join(process.cwd(), 'uploads', 'pitches', filename);

    if (fs.existsSync(localPath)) {
      // Serve local file
      res.sendFile(localPath);
    } else {
      // If file doesn't exist locally, check if it's an S3 URL in the database
      const [rows] = await db.query(
        'SELECT article_attachment FROM pitch_submissions WHERE article_attachment LIKE ?',
        [`%${filename}%`]
      );

      if (rows.length > 0 && rows[0].article_attachment) {
        const attachmentUrl = rows[0].article_attachment;

        // If it's a Cloudinary/S3 URL, proxy the content instead of redirecting
        if (attachmentUrl.startsWith('http')) {
          try {
            // Check if it's a Cloudinary URL
            if (attachmentUrl.includes('cloudinary.com')) {
              const cloudinary = require('cloudinary').v2;
              cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
              });
              
              // Extract public ID from URL and use Cloudinary SDK to fetch
              const urlParts = attachmentUrl.split('/');
              const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
              if (versionIndex !== -1) {
                const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
                const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
                
                // Use Cloudinary SDK to get the resource with proper authentication
                const resource = await cloudinary.api.resource(publicId, { resource_type: 'auto' });
                if (resource && resource.secure_url) {
                  const response = await fetch(resource.secure_url);
                  if (!response.ok) {
                    throw new Error(`Failed to fetch from Cloudinary: ${response.status}`);
                  }
                  const buffer = await response.arrayBuffer();
                  const contentType = response.headers.get('content-type') || 'application/octet-stream';
                  res.setHeader('Content-Type', contentType);
                  res.setHeader('Content-Disposition', 'inline');
                  return res.send(Buffer.from(buffer));
                }
              }
            }
            
            // Fallback to direct fetch for non-Cloudinary URLs
            const response = await fetch(attachmentUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch from cloud: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            const contentType = response.headers.get('content-type') || 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline');
            return res.send(Buffer.from(buffer));
          } catch (error) {
            console.error('Error proxying cloud file:', error);
            return res.status(500).json({
              error: 'Failed to fetch file from cloud storage',
              message: error.message
            });
          }
        }

        // If it's a local path but file doesn't exist, return error
        res.status(404).json({
          error: 'File not found on server',
          message: 'The attachment file is not available. This may be because the file was stored locally on a previous deployment and is no longer available.',
          suggestion: 'Please ask the submitter to provide the file again.'
        });
      } else {
        // No matching record found
        res.status(404).json({
          error: 'Attachment not found',
          message: 'No attachment record found with this filename.'
        });
      }
    }
  } catch (error) {
    console.error('Error serving attachment:', error);
    res.status(500).json({ error: 'Server error while serving attachment' });
  }
});

// Get single pitch submission (editor+)
router.get('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pitch_submissions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pitch submission not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pitch submission (public - for external submissions)
router.post('/', upload, optionalAuth, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      topic,
      pitch_title,
      pitch_description,
      author_bio,
      social_media,
      topics_of_interest,
      previous_publications,
      experience,
      status
    } = req.body;

    let article_attachment = null;
    if (req.file) {
      console.log('useS3:', useS3, 'useCloudinary:', useCloudinary);
      console.log('File received:', req.file.originalname);
      console.log('File has buffer:', !!req.file.buffer);
      console.log('File has path:', !!req.file.path);
      console.log('File size:', req.file.size);
      
      if (useS3 || useCloudinary) {
        console.log('Uploading to cloud storage...');
        try {
          article_attachment = await uploadFileToCloud(req.file, 'pitches');
          console.log('Cloud upload result:', article_attachment);
        } catch (error) {
          console.error('Cloud upload failed:', error);
          console.error('Error details:', error.message);
          // Fallback to local storage if cloud upload fails
          console.log('Falling back to local storage');
          article_attachment = `/uploads/pitches/${req.file.filename}`;
        }
      } else {
        console.log('Using local storage');
        article_attachment = `/uploads/pitches/${req.file.filename}`;
      }
    }

    const [result] = await db.query(
      `INSERT INTO pitch_submissions
       (full_name, email, phone, topic, pitch_title, pitch_description, author_bio, social_media, topics_of_interest, previous_publications, experience, article_attachment, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone || null,
        topic || null,
        pitch_title,
        pitch_description,
        author_bio || null,
        social_media || null,
        topics_of_interest || null,
        previous_publications || null,
        experience || null,
        article_attachment,
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Pitch submission created successfully', article_attachment });
  } catch (error) {
    console.error('Error creating pitch submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pitch submission (editor+)
router.put('/:id', upload, authenticate, isEditor, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      topic,
      pitch_title,
      pitch_description,
      author_bio,
      social_media,
      topics_of_interest,
      previous_publications,
      experience,
      status
    } = req.body;

    let article_attachment = req.body.article_attachment || null;
    if (req.file) {
      console.log('useS3:', useS3, 'useCloudinary:', useCloudinary);
      if (useS3 || useCloudinary) {
        console.log('Uploading to cloud storage...');
        article_attachment = await uploadFileToCloud(req.file, 'pitches');
        console.log('Cloud upload result:', article_attachment);
      } else {
        console.log('Using local storage');
        article_attachment = `/uploads/pitches/${req.file.filename}`;
      }
    }

    await db.query(
      `UPDATE pitch_submissions
       SET full_name = ?, email = ?, phone = ?, topic = ?, pitch_title = ?, pitch_description = ?,
           author_bio = ?, social_media = ?, topics_of_interest = ?, previous_publications = ?,
           experience = ?, article_attachment = ?, status = ?
       WHERE id = ?`,
      [
        full_name,
        email,
        phone || null,
        topic || null,
        pitch_title,
        pitch_description,
        author_bio || null,
        social_media || null,
        topics_of_interest || null,
        previous_publications || null,
        experience || null,
        article_attachment,
        status,
        req.params.id
      ]
    );
    res.json({ message: 'Pitch submission updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only (editor+)
router.patch('/:id/status', authenticate, isEditor, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE pitch_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Pitch submission status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pitch submission (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete pitch submissions' });
    }
    await db.query('DELETE FROM pitch_submissions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pitch submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
