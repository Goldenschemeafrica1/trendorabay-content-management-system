const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get all settings (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM site_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting (admin+)
router.put('/:key', authenticate, isAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [req.params.key, value, value]
    );
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
