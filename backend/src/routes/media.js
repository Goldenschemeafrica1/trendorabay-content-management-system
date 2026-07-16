const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isSuperAdmin, isEditor, hasRole } = require('../middleware/authorize');
const { mediaIdValidation } = require('../middleware/validation');

// Configure upload for media with single file support
const upload = uploadSingle('file', 'media', 10 * 1024 * 1024); // Single file, 10MB

// Get all media (editor and above for gallery access)
router.get('/', authenticate, isEditor, async (req, res) => {
  try {
    const { file_type, folder } = req.query;
    let query = 'SELECT * FROM media';
    const params = [];
    
    if (file_type) {
      query += ' WHERE file_type LIKE ?';
      params.push(`%${file_type}%`);
    }
    
    if (folder) {
      const operator = params.length > 0 ? ' AND' : ' WHERE';
      query += `${operator} folder = ?`;
      params.push(folder);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json({ data: rows });
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

// Create media (public for gallery use)
router.post('/', upload, async (req, res) => {
  try {
    const { folder } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let file_url;
    if (useCloudinary) {
      file_url = await uploadFileToCloud(file, folder || 'media');
    } else {
      file_url = file.location || `/uploads/media/${file.filename}`;
    }
    
    // Skip database insertion for now and just return the URL
    res.status(201).json({ 
      message: 'File uploaded successfully', 
      media: {
        file_url: file_url
      }
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
