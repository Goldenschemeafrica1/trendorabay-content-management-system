const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all sponsorships (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, p.name as partner_name 
      FROM sponsorships s 
      LEFT JOIN partners p ON s.partner_id = p.id
      ORDER BY s.created_at DESC
    `);
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      sponsor: row.partner_name || row.title,
      campaign: row.title,
      amount: parseFloat(row.amount) || 0,
      startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
      endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sponsorship (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { title, partner_id, amount, start_date, end_date, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO sponsorships (title, partner_id, amount, start_date, end_date, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, partner_id, amount, start_date, end_date, status || 'pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Sponsorship created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sponsorship (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { title, partner_id, amount, start_date, end_date, status } = req.body;
    await db.query(
      `UPDATE sponsorships SET title = ?, partner_id = ?, amount = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?`,
      [title, partner_id, amount, start_date, end_date, status, req.params.id]
    );
    res.json({ message: 'Sponsorship updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sponsorship (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete sponsorships' });
    }
    await db.query('DELETE FROM sponsorships WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sponsorship deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
