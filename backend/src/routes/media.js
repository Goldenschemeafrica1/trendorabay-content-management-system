const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadMultiple, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isSuperAdmin, hasRole } = require('../middleware/authorize');
const { mediaIdValidation } = require('../middleware/validation');

// Configure upload for media with S3 support
const upload = uploadMultiple('files', 10, 'media', 10 * 1024 * 1024); // 10 files, 10MB each

// Get all media (superadmin only)
router.get('/', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single media (superadmin only)
router.get('/:id', authenticate, isSuperAdmin, mediaIdValidation, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create media (superadmin only)
router.post('/', authenticate, isSuperAdmin, upload, async (req, res) => {
  try {
    const { folder } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedMedia = [];
    
    for (const file of files) {
      let file_url;
      if (useCloudinary) {
        file_url = await uploadFileToCloud(file, folder || 'media');
      } else {
        file_url = file.location || `/uploads/media/${file.filename}`;
      }
      
      const [result] = await db.query(
        `INSERT INTO media (filename, original_name, file_url, file_type, file_size, folder, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [file.filename || file.key, file.originalname, file_url, file.mimetype, file.size, folder || 'Blog Posts', req.user.id]
      );
      uploadedMedia.push({
        id: result.insertId,
        filename: file.filename || file.key,
        original_name: file.originalname,
        file_url: file_url,
        file_type: file.mimetype,
        file_size: file.size,
        folder: folder || 'Blog Posts'
      });
    }
    
    res.status(201).json({ 
      message: 'Files uploaded successfully', 
      media: uploadedMedia 
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete media (superadmin only)
router.delete('/:id', authenticate, isSuperAdmin, mediaIdValidation, async (req, res) => {
  try {
    // Get media file info before deletion
    const [rows] = await db.query('SELECT * FROM media WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    const media = rows[0];
    
    // Delete from Cloudinary if it's a Cloudinary URL
    if (media.file_url.includes('cloudinary.com')) {
      try {
        await deleteFromCloudinary(media.file_url);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    } else if (media.file_url.includes('amazonaws.com')) {
      // Delete from S3 if it's an S3 URL
      await deleteFromS3(media.file_url);
    } else {
      // Delete local file
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../', media.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete from database
    await db.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
