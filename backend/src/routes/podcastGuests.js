const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all podcast guests (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM podcast_guests ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single podcast guest (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM podcast_guests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Podcast guest not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create podcast guest (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { name, title, bio, avatar_url, email, episode, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO podcast_guests (name, title, bio, avatar_url, email, episode, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        title || null, 
        bio || null, 
        avatar_url || null, 
        email || null, 
        episode || null, 
        status || 'active'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Podcast guest created successfully' });
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update podcast guest (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, title, bio, avatar_url, email, episode, status } = req.body;
    await db.query(
      `UPDATE podcast_guests SET name = ?, title = ?, bio = ?, avatar_url = ?, email = ?, episode = ?, status = ? WHERE id = ?`,
      [
        name, 
        title || null, 
        bio || null, 
        avatar_url || null, 
        email || null, 
        episode || null, 
        status, 
        req.params.id
      ]
    );
    res.json({ message: 'Podcast guest updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete podcast guest (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete podcast guests' });
    }
    await db.query('DELETE FROM podcast_guests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Podcast guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
