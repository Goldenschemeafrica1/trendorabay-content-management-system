const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadFields } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for podcasts with S3 support
const upload = uploadFields([
  { name: 'cover_art', maxCount: 1 },
  { name: 'audio_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
], 'podcasts', 200 * 1024 * 1024); // 200MB limit for podcasts

// Get all podcasts (public read, editor+ for full access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM podcasts p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single podcast (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM podcasts p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create podcast (editor+)
router.post('/', authenticate, isEditor, upload, async (req, res) => {
  try {
    const { title, episode_number, category, description, guest, duration, host, status } = req.body;
    const cover_art_url = req.files['cover_art'] ? req.files['cover_art'][0].location : null;
    const audio_file_url = req.files['audio_file'] ? req.files['audio_file'][0].location : null;
    const video_file_url = req.files['video_file'] ? req.files['video_file'][0].location : null;
    const published_at = new Date().toISOString().split('T')[0];
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    // Convert string values to proper types
    const episodeNumberValue = episode_number && episode_number !== 'undefined' ? parseInt(episode_number) : null;
    
    const [result] = await db.query(
      `INSERT INTO podcasts (title, episode_number, description, cover_art_url, audio_file_url, video_file_url, category_id, published_at, guest, duration, host, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, episodeNumberValue, description, cover_art_url, audio_file_url, video_file_url, category_id, published_at, guest || null, duration || null, host || null, status || 'draft']
    );
    res.status(201).json({ id: result.insertId, message: 'Podcast created successfully' });
  } catch (error) {
    console.error('Error creating podcast:', error);
    console.error('Error details:', error.sqlMessage || error.message);
    res.status(500).json({ error: error.message, details: error.sqlMessage });
  }
});

// Update podcast (editor+)
router.put('/:id', authenticate, isEditor, upload, async (req, res) => {
  try {
    const { title, episode_number, description, category, guest, duration, host, status } = req.body;
    const cover_art_url = req.files['cover_art'] ? req.files['cover_art'][0].location : req.body.cover_art_url;
    const audio_file_url = req.files['audio_file'] ? req.files['audio_file'][0].location : req.body.audio_file_url;
    const video_file_url = req.files['video_file'] ? req.files['video_file'][0].location : req.body.video_file_url;
    
    // Convert string values to proper types
    const episodeNumberValue = episode_number && episode_number !== 'undefined' ? parseInt(episode_number) : null;
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    // Get current podcast to preserve existing data if not being updated
    const [currentPodcast] = await db.query('SELECT * FROM podcasts WHERE id = ?', [req.params.id]);
    const final_cover_art_url = cover_art_url || currentPodcast[0]?.cover_art_url;
    const final_audio_file_url = audio_file_url || currentPodcast[0]?.audio_file_url;
    const final_video_file_url = video_file_url || currentPodcast[0]?.video_file_url;
    const final_category_id = category_id || currentPodcast[0]?.category_id;
    const final_published_at = currentPodcast[0]?.published_at;
    
    await db.query(
      `UPDATE podcasts 
       SET title = ?, episode_number = ?, description = ?, cover_art_url = ?, audio_file_url = ?, video_file_url = ?, category_id = ?, published_at = ?, guest = ?, duration = ?, host = ?, status = ? 
       WHERE id = ?`,
      [title, episodeNumberValue, description, final_cover_art_url, final_audio_file_url, final_video_file_url, final_category_id, final_published_at, guest || null, duration || null, host || null, status || 'draft', req.params.id]
    );
    res.json({ message: 'Podcast updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete podcast (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete podcasts' });
    }
    await db.query('DELETE FROM podcasts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
