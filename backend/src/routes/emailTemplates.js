const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get all email templates (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_templates');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single email template (admin+)
router.get('/:template_name', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_templates WHERE template_name = ?', [req.params.template_name]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update email template (admin+)
router.put('/:template_name', authenticate, isAdmin, async (req, res) => {
  try {
    const { subject, content } = req.body;
    await db.query(
      `INSERT INTO email_templates (template_name, subject, content) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE subject = ?, content = ?`,
      [req.params.template_name, subject, content, subject, content]
    );
    res.json({ message: 'Template updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
