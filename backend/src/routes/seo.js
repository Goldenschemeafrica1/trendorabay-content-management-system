const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get all SEO settings (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_settings');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SEO settings for a page (public read)
router.get('/:page_name', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seo_settings WHERE page_name = ?', [req.params.page_name]);
    if (rows.length === 0) {
      return res.json({ page_name: req.params.page_name });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update SEO settings (admin+)
router.put('/:page_name', authenticate, isAdmin, async (req, res) => {
  try {
    const { meta_title, meta_description, og_title, og_description, og_image } = req.body;
    await db.query(
      `INSERT INTO seo_settings (page_name, meta_title, meta_description, og_title, og_description, og_image) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE meta_title = ?, meta_description = ?, og_title = ?, og_description = ?, og_image = ?`,
      [req.params.page_name, meta_title, meta_description, og_title, og_description, og_image, 
       meta_title, meta_description, og_title, og_description, og_image]
    );
    res.json({ message: 'SEO settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
