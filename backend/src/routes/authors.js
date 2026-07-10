const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for authors with S3 support
const upload = uploadSingle('avatar', 'authors', 5 * 1024 * 1024); // 5MB limit for avatars

// Get all authors (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM authors ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single author (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM authors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create author (editor+)
router.post('/', authenticate, isEditor, upload, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const avatar_url = req.file ? (req.file.location || `/uploads/authors/${req.file.filename}`) : null;
    
    const [result] = await db.query(
      `INSERT INTO authors (name, bio, avatar_url, email) 
       VALUES (?, ?, ?, ?)`,
      [name, bio, avatar_url, email]
    );
    res.status(201).json({ id: result.insertId, message: 'Author created successfully' });
  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update author (editor+)
router.put('/:id', authenticate, isEditor, upload, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    const { name, email, bio } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Get current author to preserve existing data
    const [currentAuthor] = await db.query('SELECT * FROM authors WHERE id = ?', [req.params.id]);
    
    const avatar_url = req.file ? (req.file.location || `/uploads/authors/${req.file.filename}`) : currentAuthor[0]?.avatar_url;
    
    // Build the update query dynamically based on what fields are provided
    let query = 'UPDATE authors SET name = ?, email = ?, bio = ?, avatar_url = ?';
    let params = [name, email, bio, avatar_url];
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    console.log('Query:', query);
    console.log('Params:', params);
    
    await db.query(query, params);
    res.json({ message: 'Author updated successfully' });
  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete author (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete authors' });
    }
    await db.query('DELETE FROM authors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Author deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
