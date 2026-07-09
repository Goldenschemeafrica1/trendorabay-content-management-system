const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all podcast hosts (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM podcast_hosts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create podcast host (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { name, bio, photo_url, avatar_url, email, twitter, instagram, linkedin, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO podcast_hosts (name, bio, photo_url, email, twitter, instagram, linkedin, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        bio || null, 
        photo_url || avatar_url || null, 
        email || null, 
        twitter || null, 
        instagram || null, 
        linkedin || null, 
        status || 'active'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Podcast host created successfully' });
  } catch (error) {
    console.error('Error creating host:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update podcast host (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, bio, photo_url, avatar_url, email, twitter, instagram, linkedin, status } = req.body;
    await db.query(
      `UPDATE podcast_hosts SET name = ?, bio = ?, photo_url = ?, email = ?, twitter = ?, instagram = ?, linkedin = ?, status = ? WHERE id = ?`,
      [
        name, 
        bio || null, 
        photo_url || avatar_url || null, 
        email || null, 
        twitter || null, 
        instagram || null, 
        linkedin || null, 
        status, 
        req.params.id
      ]
    );
    res.json({ message: 'Podcast host updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete podcast host (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete podcast hosts' });
    }
    await db.query('DELETE FROM podcast_hosts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Podcast host deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
