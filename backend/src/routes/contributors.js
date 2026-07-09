const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all contributors (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contributors ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unique roles
router.get('/roles', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT role FROM contributors WHERE role IS NOT NULL AND role != "" ORDER BY role');
    const roles = rows.map(row => row.role);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contributor (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { name, email, bio, role, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO contributors (name, email, bio, role, status) VALUES (?, ?, ?, ?, ?)`,
      [name, email, bio, role, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Contributor created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contributor (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, email, bio, role, status } = req.body;
    await db.query(
      `UPDATE contributors SET name = ?, email = ?, bio = ?, role = ?, status = ? WHERE id = ?`,
      [name, email, bio, role, status, req.params.id]
    );
    res.json({ message: 'Contributor updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contributor (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete contributors' });
    }
    await db.query('DELETE FROM contributors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contributor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
