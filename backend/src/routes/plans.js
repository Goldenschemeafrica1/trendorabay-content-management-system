const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, hasRole } = require('../middleware/authorize');

// Get all plans (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE status = "active" ORDER BY price ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create plan (admin+)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, billing_cycle, features, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO subscription_plans (name, description, price, billing_cycle, features, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, billing_cycle || 'monthly', JSON.stringify(features), status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Plan created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update plan (admin+)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, price, billing_cycle, features, status } = req.body;
    await db.query(
      `UPDATE subscription_plans SET name = ?, description = ?, price = ?, billing_cycle = ?, features = ?, status = ? WHERE id = ?`,
      [name, description, price, billing_cycle, JSON.stringify(features), status, req.params.id]
    );
    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete plan (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM subscription_plans WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
