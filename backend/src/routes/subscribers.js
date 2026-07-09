const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get all subscribers (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, p.name as plan_name 
      FROM subscribers s 
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscriber (public - for user subscriptions)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, plan_id, status, subscription_start, subscription_end } = req.body;
    const [result] = await db.query(
      `INSERT INTO subscribers (name, email, plan_id, status, subscription_start, subscription_end) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, plan_id, status || 'active', subscription_start, subscription_end]
    );
    res.status(201).json({ id: result.insertId, message: 'Subscriber created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscriber (admin+)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, plan_id, status, subscription_start, subscription_end } = req.body;
    await db.query(
      `UPDATE subscribers SET name = ?, email = ?, plan_id = ?, status = ?, subscription_start = ?, subscription_end = ? WHERE id = ?`,
      [name, email, plan_id, status, subscription_start, subscription_end, req.params.id]
    );
    res.json({ message: 'Subscriber updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscriber (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
