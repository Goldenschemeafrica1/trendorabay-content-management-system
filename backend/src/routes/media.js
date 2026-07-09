const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isSuperAdmin, hasRole } = require('../middleware/authorize');
const { mediaIdValidation } = require('../middleware/validation');

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/mpeg': '.mpeg',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav'
};

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`), false);
  }
};

// Configure multer for file uploads with security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/media';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = ALLOWED_FILE_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  }
});

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
router.post('/', authenticate, isSuperAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const { folder } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedMedia = [];
    
    for (const file of files) {
      const file_url = `/uploads/media/${file.filename}`;
      const [result] = await db.query(
        `INSERT INTO media (filename, original_name, file_url, file_type, file_size, folder, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [file.filename, file.originalname, file_url, file.mimetype, file.size, folder || 'Blog Posts', req.user.id]
      );
      uploadedMedia.push({
        id: result.insertId,
        filename: file.filename,
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
    
    // Delete from database
    await db.query('DELETE FROM media WHERE id = ?', [req.params.id]);
    
    // Delete physical file
    const filePath = path.join(__dirname, '../../', media.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
