const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFileToCloud, useS3 } = require('../config/upload');
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

    let article_attachment = null;
    if (req.file) {
      if (useS3) {
        article_attachment = await uploadFileToCloud(req.file, 'pitches');
      } else {
        article_attachment = `/uploads/pitches/${req.file.filename}`;
      }
    }

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

    let article_attachment = req.body.article_attachment || null;
    if (req.file) {
      if (useS3) {
        article_attachment = await uploadFileToCloud(req.file, 'pitches');
      } else {
        article_attachment = `/uploads/pitches/${req.file.filename}`;
      }
    }

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

// Proxy route to serve pitch attachments (handles both local and S3 URLs)
router.get('/attachment/:filename', authenticate, isEditor, async (req, res) => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');

    // Check if it's a local file
    const localPath = path.join(process.cwd(), 'uploads', 'pitches', filename);

    if (fs.existsSync(localPath)) {
      // Serve local file
      res.sendFile(localPath);
    } else {
      // If file doesn't exist locally, check if it's an S3 URL in the database
      const [rows] = await db.query(
        'SELECT article_attachment FROM pitch_submissions WHERE article_attachment LIKE ?',
        [`%${filename}%`]
      );

      if (rows.length > 0 && rows[0].article_attachment) {
        // Redirect to S3 URL
        return res.redirect(rows[0].article_attachment);
      }

      // File not found
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error serving attachment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
