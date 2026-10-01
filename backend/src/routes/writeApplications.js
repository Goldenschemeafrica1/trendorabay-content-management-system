const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isEditor } = require('../middleware/authorize');

console.log('Write applications route loaded');

// Get all write applications (editor+)
router.get('/', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM write_applications ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single write application (editor+)
router.get('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM write_applications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Write application not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create write application (public - for external submissions)
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      location,
      short_bio,
      areas_of_interest,
      writing_experience,
      portfolio_url,
      social_media_links,
      writing_sample_url,
      why_write_for_trendorabay,
      cv_resume_url,
      profile_photo_url,
      agree_to_guidelines,
      status
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO write_applications
       (full_name, email, phone_number, location, short_bio, areas_of_interest, writing_experience,
        portfolio_url, social_media_links, writing_sample_url, why_write_for_trendorabay,
        cv_resume_url, profile_photo_url, agree_to_guidelines, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone_number || null,
        location,
        short_bio,
        areas_of_interest ? JSON.stringify(areas_of_interest) : null,
        writing_experience,
        portfolio_url || null,
        social_media_links ? JSON.stringify(social_media_links) : null,
        writing_sample_url || null,
        why_write_for_trendorabay,
        cv_resume_url || null,
        profile_photo_url || null,
        agree_to_guidelines || 0,
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Write application created successfully' });
  } catch (error) {
    console.error('Error creating write application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update write application (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      location,
      short_bio,
      areas_of_interest,
      writing_experience,
      portfolio_url,
      social_media_links,
      writing_sample_url,
      why_write_for_trendorabay,
      cv_resume_url,
      profile_photo_url,
      agree_to_guidelines,
      status
    } = req.body;

    await db.query(
      `UPDATE write_applications
       SET full_name = ?, email = ?, phone_number = ?, location = ?, short_bio = ?,
           areas_of_interest = ?, writing_experience = ?, portfolio_url = ?,
           social_media_links = ?, writing_sample_url = ?, why_write_for_trendorabay = ?,
           cv_resume_url = ?, profile_photo_url = ?, agree_to_guidelines = ?, status = ?
       WHERE id = ?`,
      [
        full_name,
        email,
        phone_number || null,
        location,
        short_bio,
        areas_of_interest ? JSON.stringify(areas_of_interest) : null,
        writing_experience,
        portfolio_url || null,
        social_media_links ? JSON.stringify(social_media_links) : null,
        writing_sample_url || null,
        why_write_for_trendorabay,
        cv_resume_url || null,
        profile_photo_url || null,
        agree_to_guidelines || 0,
        status,
        req.params.id
      ]
    );
    res.json({ message: 'Write application updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only (editor+)
router.patch('/:id/status', authenticate, isEditor, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE write_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Write application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete write application (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { hasRole } = require('../middleware/authorize');
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete write applications' });
    }
    await db.query('DELETE FROM write_applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Write application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
