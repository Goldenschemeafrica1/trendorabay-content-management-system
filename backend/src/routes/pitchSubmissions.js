const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for pitch submissions with S3 support
const upload = uploadSingle('article_attachment', 'pitches', 10 * 1024 * 1024); // 10MB limit for pitch documents

// Get all pitch submissions (editor+)
router.get('/', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pitch_submissions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pitch submission (editor+)
router.get('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pitch_submissions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pitch submission not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pitch submission (public - for external submissions)
router.post('/', upload, optionalAuth, async (req, res) => {
  try {
    const { 
      full_name, 
      email, 
      phone, 
      topic, 
      pitch_title, 
      pitch_description, 
      author_bio, 
      social_media, 
      topics_of_interest, 
      previous_publications, 
      experience,
      status 
    } = req.body;
    
    const article_attachment = req.file ? (req.file.location || `/uploads/pitches/${req.file.filename}`) : null;
    
    const [result] = await db.query(
      `INSERT INTO pitch_submissions 
       (full_name, email, phone, topic, pitch_title, pitch_description, author_bio, social_media, topics_of_interest, previous_publications, experience, article_attachment, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name, 
        email, 
        phone || null, 
        topic || null, 
        pitch_title, 
        pitch_description, 
        author_bio || null, 
        social_media || null, 
        topics_of_interest || null, 
        previous_publications || null, 
        experience || null, 
        article_attachment,
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Pitch submission created successfully', article_attachment });
  } catch (error) {
    console.error('Error creating pitch submission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pitch submission (editor+)
router.put('/:id', upload, authenticate, isEditor, async (req, res) => {
  try {
    const { 
      full_name, 
      email, 
      phone, 
      topic, 
      pitch_title, 
      pitch_description, 
      author_bio, 
      social_media, 
      topics_of_interest, 
      previous_publications, 
      experience,
      status 
    } = req.body;
    
    const article_attachment = req.file ? `/uploads/pitches/${req.file.filename}` : req.body.article_attachment || null;
    
    await db.query(
      `UPDATE pitch_submissions 
       SET full_name = ?, email = ?, phone = ?, topic = ?, pitch_title = ?, pitch_description = ?, 
           author_bio = ?, social_media = ?, topics_of_interest = ?, previous_publications = ?, 
           experience = ?, article_attachment = ?, status = ? 
       WHERE id = ?`,
      [
        full_name, 
        email, 
        phone || null, 
        topic || null, 
        pitch_title, 
        pitch_description, 
        author_bio || null, 
        social_media || null, 
        topics_of_interest || null, 
        previous_publications || null, 
        experience || null, 
        article_attachment,
        status, 
        req.params.id
      ]
    );
    res.json({ message: 'Pitch submission updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only (editor+)
router.patch('/:id/status', authenticate, isEditor, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE pitch_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Pitch submission status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pitch submission (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete pitch submissions' });
    }
    await db.query('DELETE FROM pitch_submissions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pitch submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
