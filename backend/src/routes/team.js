const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');
const { uploadSingle } = require('../config/upload');

// Configure upload for team member avatars
const upload = uploadSingle('image', 'team', 5 * 1024 * 1024); // 5MB limit for team images

// Upload team member avatar (editor+)
router.post('/upload', authenticate, isEditor, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const file_url = req.file ? (req.file.location || `/uploads/team/${req.file.filename}`) : null;
    res.status(201).json({
      message: 'Image uploaded successfully',
      file_url: file_url,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all team members (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_members ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create team member (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { name, role, bio, avatar_url, email, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO team_members (name, role, bio, avatar_url, email, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, role, bio, avatar_url, email, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Team member created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team member (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, role, bio, avatar_url, email, status } = req.body;
    await db.query(
      `UPDATE team_members SET name = ?, role = ?, bio = ?, avatar_url = ?, email = ?, status = ? WHERE id = ?`,
      [name, role, bio, avatar_url, email, status, req.params.id]
    );
    res.json({ message: 'Team member updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete team member (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete team members' });
    }
    await db.query('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
