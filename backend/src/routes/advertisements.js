const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Configure upload for advertisements with S3 support
const upload = uploadSingle('image', 'advertisements', 5 * 1024 * 1024); // 5MB limit for ad images

// Get all advertisements (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM advertisements ORDER BY created_at DESC');
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      advertiser: row.advertiser_name,
      campaign: row.campaign_name,
      startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
      endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null,
      start_date: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
      end_date: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create advertisement (admin+)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      title, 
      advertiser_name, 
      campaign_name, 
      image_url, 
      mobile_image_url,
      destination_url, 
      location, 
      priority, 
      rotation, 
      active, 
      start_date, 
      end_date, 
      budget,
      impressions,
      clicks
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO advertisements (title, advertiser_name, campaign_name, image_url, mobile_image_url, destination_url, location, priority, rotation, active, start_date, end_date, budget, impressions, clicks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        advertiser_name, 
        campaign_name, 
        image_url, 
        mobile_image_url,
        destination_url, 
        location, 
        priority, 
        rotation, 
        active, 
        start_date, 
        end_date, 
        budget,
        impressions || 0,
        clicks || 0
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Advertisement created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update advertisement (admin+)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      title, 
      advertiser_name, 
      campaign_name, 
      image_url, 
      mobile_image_url,
      destination_url, 
      location, 
      priority, 
      rotation, 
      active, 
      start_date, 
      end_date, 
      budget,
      impressions,
      clicks
    } = req.body;
    console.log('PUT request body:', req.body);
    await db.query(
      `UPDATE advertisements SET title = ?, advertiser_name = ?, campaign_name = ?, image_url = ?, mobile_image_url = ?, destination_url = ?, location = ?, priority = ?, rotation = ?, active = ?, start_date = ?, end_date = ?, budget = ?, impressions = ?, clicks = ? WHERE id = ?`,
      [
        title, 
        advertiser_name, 
        campaign_name, 
        image_url, 
        mobile_image_url,
        destination_url, 
        location, 
        priority, 
        rotation, 
        active, 
        start_date, 
        end_date, 
        budget,
        impressions || 0,
        clicks || 0,
        req.params.id
      ]
    );
    res.json({ message: 'Advertisement updated successfully' });
  } catch (error) {
    console.error('PUT error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete advertisement (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload advertisement image (admin+)
router.post('/upload', authenticate, isAdmin, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const file_url = req.file ? (req.file.location || `/uploads/advertisements/${req.file.filename}`) : null;
    res.status(201).json({
      message: 'Image uploaded successfully',
      file_url: file_url,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
