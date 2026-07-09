const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all community posts (public read for published)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, u.name as author_name 
      FROM community_posts cp 
      LEFT JOIN cms_users u ON cp.author_id = u.id
      ORDER BY cp.created_at DESC
    `);
    
    // Non-authenticated users only see published posts
    if (!req.user) {
      const publishedPosts = rows.filter(p => p.status === 'published');
      return res.json(publishedPosts);
    }
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create community post (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { title, content, author_id, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO community_posts (title, content, author_id, status) VALUES (?, ?, ?, ?)`,
      [title, content, author_id, status || 'draft']
    );
    res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update community post (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { title, content, status } = req.body;
    await db.query(
      `UPDATE community_posts SET title = ?, content = ?, status = ? WHERE id = ?`,
      [title, content, status, req.params.id]
    );
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete community post (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete community posts' });
    }
    await db.query('DELETE FROM community_posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
