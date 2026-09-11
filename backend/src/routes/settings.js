const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');
const { logAuditEvent } = require('../middleware/securityLogger');
const { verifyRequestSignature } = require('../middleware/requestSignature');

// Define allowed setting keys to prevent injection
const ALLOWED_SETTINGS = [
  'site_title',
  'site_description',
  'site_keywords',
  'contact_email',
  'contact_phone',
  'contact_address',
  'social_facebook',
  'social_twitter',
  'social_instagram',
  'social_linkedin',
  'social_youtube',
  'analytics_google_id',
  'logo_url',
  'favicon_url',
  'maintenance_mode',
  'max_upload_size'
];

// Validate setting key
const isValidSettingKey = (key) => {
  return ALLOWED_SETTINGS.includes(key) && /^[a-z_]+$/.test(key);
};

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
router.put('/:key', authenticate, isAdmin, verifyRequestSignature, async (req, res) => {
  try {
    const { value } = req.body;
    const settingKey = req.params.key;

    // Validate setting key
    if (!isValidSettingKey(settingKey)) {
      return res.status(400).json({ error: 'Invalid setting key' });
    }

    // Validate value based on key type
    if (settingKey === 'contact_email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    if (settingKey === 'maintenance_mode') {
      if (value !== 'true' && value !== 'false' && value !== true && value !== false) {
        return res.status(400).json({ error: 'Maintenance mode must be true or false' });
      }
    }

    // Sanitize value to prevent XSS
    const sanitizedValue = typeof value === 'string' 
      ? value.replace(/[<>]/g, '') 
      : value;

    // Get old value for audit logging
    const [oldSetting] = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      [settingKey]
    );

    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [settingKey, sanitizedValue, sanitizedValue]
    );

    // Log audit event
    await logAuditEvent(
      'SETTING_UPDATED',
      'setting',
      settingKey,
      { ...req.user, req },
      oldSetting.length > 0 ? { value: oldSetting[0].setting_value } : null,
      { value: sanitizedValue }
    );

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
