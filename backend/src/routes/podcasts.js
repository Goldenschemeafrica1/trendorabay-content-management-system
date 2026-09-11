const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadFields, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { deleteFromCloudinary } = require('../config/cloudinary');
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
    console.log('[GET /api/podcasts] Fetching podcasts...');
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM podcasts p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    console.log('[GET /api/podcasts] Successfully fetched', rows.length, 'podcasts');
    res.json(rows);
  } catch (error) {
    console.error('[GET /api/podcasts] Error:', error);
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
    
    let cover_art_url = null;
    let audio_file_url = null;
    let video_file_url = null;
    
    // Upload files to cloud storage (Cloudinary) if configured
    const coverArtFile = req.files?.['cover_art']?.[0];
    const audioFile = req.files?.['audio_file']?.[0];
    const videoFile = req.files?.['video_file']?.[0];
    
    if (coverArtFile) {
      if (useCloudinary) {
        cover_art_url = await uploadFileToCloud(coverArtFile, 'podcasts');
      } else {
        cover_art_url = coverArtFile.location || `/uploads/podcasts/${coverArtFile.filename}`;
      }
    }
    
    if (audioFile) {
      if (useCloudinary) {
        audio_file_url = await uploadFileToCloud(audioFile, 'podcasts');
      } else {
        audio_file_url = audioFile.location || `/uploads/podcasts/${audioFile.filename}`;
      }
    }
    
    if (videoFile) {
      if (useCloudinary) {
        video_file_url = await uploadFileToCloud(videoFile, 'podcasts');
      } else {
        video_file_url = videoFile.location || `/uploads/podcasts/${videoFile.filename}`;
      }
    }
    
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
    res.status(500).json({ error: 'Failed to create podcast' });
  }
});

// Update podcast (editor+)
router.put('/:id', authenticate, isEditor, upload, async (req, res) => {
  try {
    const { title, episode_number, description, category, guest, duration, host, status } = req.body;
    
    // Get current podcast to preserve existing data if not being updated
    const [currentPodcast] = await db.query('SELECT * FROM podcasts WHERE id = ?', [req.params.id]);
    
    let cover_art_url = currentPodcast[0]?.cover_art_url;
    let audio_file_url = currentPodcast[0]?.audio_file_url;
    let video_file_url = currentPodcast[0]?.video_file_url;
    
    // Upload files to cloud storage (Cloudinary) if configured
    const coverArtFile = req.files?.['cover_art']?.[0];
    const audioFile = req.files?.['audio_file']?.[0];
    const videoFile = req.files?.['video_file']?.[0];
    
    if (coverArtFile) {
      if (useCloudinary) {
        cover_art_url = await uploadFileToCloud(coverArtFile, 'podcasts');
        // Delete old cover art from Cloudinary if it exists
        if (currentPodcast[0]?.cover_art_url && currentPodcast[0].cover_art_url.includes('cloudinary.com')) {
          try {
            await deleteFromCloudinary(currentPodcast[0].cover_art_url);
          } catch (error) {
            console.error('Error deleting old cover art from Cloudinary:', error);
          }
        }
      } else {
        cover_art_url = coverArtFile.location || `/uploads/podcasts/${coverArtFile.filename}`;
      }
    }
    
    if (audioFile) {
      if (useCloudinary) {
        audio_file_url = await uploadFileToCloud(audioFile, 'podcasts');
        // Delete old audio from Cloudinary if it exists
        if (currentPodcast[0]?.audio_file_url && currentPodcast[0].audio_file_url.includes('cloudinary.com')) {
          try {
            await deleteFromCloudinary(currentPodcast[0].audio_file_url);
          } catch (error) {
            console.error('Error deleting old audio from Cloudinary:', error);
          }
        }
      } else {
        audio_file_url = audioFile.location || `/uploads/podcasts/${audioFile.filename}`;
      }
    }
    
    if (videoFile) {
      if (useCloudinary) {
        video_file_url = await uploadFileToCloud(videoFile, 'podcasts');
        // Delete old video from Cloudinary if it exists
        if (currentPodcast[0]?.video_file_url && currentPodcast[0].video_file_url.includes('cloudinary.com')) {
          try {
            await deleteFromCloudinary(currentPodcast[0].video_file_url);
          } catch (error) {
            console.error('Error deleting old video from Cloudinary:', error);
          }
        }
      } else {
        video_file_url = videoFile.location || `/uploads/podcasts/${videoFile.filename}`;
      }
    }
    
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
    
    const final_category_id = category_id || currentPodcast[0]?.category_id;
    const final_published_at = currentPodcast[0]?.published_at;
    
    await db.query(
      `UPDATE podcasts 
       SET title = ?, episode_number = ?, description = ?, cover_art_url = ?, audio_file_url = ?, video_file_url = ?, category_id = ?, published_at = ?, guest = ?, duration = ?, host = ?, status = ? 
       WHERE id = ?`,
      [title, episodeNumberValue, description, cover_art_url, audio_file_url, video_file_url, final_category_id, final_published_at, guest || null, duration || null, host || null, status || 'draft', req.params.id]
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
