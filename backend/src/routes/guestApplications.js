const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all guest applications (editor+)
router.get('/', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM guest_applications ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single guest application (editor+)
router.get('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM guest_applications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Guest application not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create guest application (public - for external applications)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      applicant_name, 
      applicant_email, 
      applicant_phone, 
      company_name, 
      job_title, 
      bio, 
      expertise_areas, 
      social_links, 
      proposed_topics, 
      availability,
      status 
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO guest_applications 
       (applicant_name, applicant_email, applicant_phone, company_name, job_title, bio, expertise_areas, social_links, proposed_topics, availability, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        applicant_name, 
        applicant_email, 
        applicant_phone || null, 
        company_name || null, 
        job_title || null, 
        bio || null, 
        expertise_areas || null, 
        social_links ? JSON.stringify(social_links) : null, 
        proposed_topics || null, 
        availability || null, 
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Guest application created successfully' });
  } catch (error) {
    console.error('Error creating guest application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update guest application (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { 
      applicant_name, 
      applicant_email, 
      applicant_phone, 
      company_name, 
      job_title, 
      bio, 
      expertise_areas, 
      social_links, 
      proposed_topics, 
      availability, 
      status,
      admin_notes 
    } = req.body;
    
    await db.query(
      `UPDATE guest_applications 
       SET applicant_name = ?, applicant_email = ?, applicant_phone = ?, company_name = ?, job_title = ?, 
           bio = ?, expertise_areas = ?, social_links = ?, proposed_topics = ?, availability = ?, 
           status = ?, admin_notes = ? 
       WHERE id = ?`,
      [
        applicant_name, 
        applicant_email, 
        applicant_phone || null, 
        company_name || null, 
        job_title || null, 
        bio || null, 
        expertise_areas || null, 
        social_links ? JSON.stringify(social_links) : null, 
        proposed_topics || null, 
        availability || null, 
        status, 
        admin_notes || null,
        req.params.id
      ]
    );
    res.json({ message: 'Guest application updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only (editor+)
router.patch('/:id/status', authenticate, isEditor, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE guest_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Guest application status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete guest application (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete guest applications' });
    }
    await db.query('DELETE FROM guest_applications WHERE id = ?', [req.params.id]);
    res.json({ message: 'Guest application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
