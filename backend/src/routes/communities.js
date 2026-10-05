const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get all communities
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.* 
      FROM communities c
      WHERE c.status = 'active'
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single community
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.* 
      FROM communities c
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to fetch community:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create community (editor+)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, slug, description, short_description, category, icon_url, cover_image_url, community_type, rules, created_by } = req.body;

    console.log('Received request body:', { name, slug, category });

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Generate slug if not provided or invalid
    let finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    console.log('Generated slug before validation:', finalSlug);

    // Fallback to timestamp if slug is still empty
    if (!finalSlug || finalSlug === '' || finalSlug === '?') {
      finalSlug = `community-${Date.now()}`;
      console.log('Using fallback slug:', finalSlug);
    }

    console.log('Final slug to use:', finalSlug);

    // Use the authenticated user's ID if created_by is not provided
    const userId = created_by || req.user?.id || null;

    const [result] = await db.query(
      `INSERT INTO communities (name, slug, description, short_description, category, icon_url, cover_image_url, community_type, rules, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, finalSlug, description, short_description, category, icon_url, cover_image_url, community_type, rules, userId]
    );

    res.status(201).json({ id: result.insertId, message: 'Community created successfully' });
  } catch (error) {
    console.error('Failed to create community:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update community (editor+)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, slug, description, short_description, category, icon_url, cover_image_url, community_type, rules, status } = req.body;
    console.log('Updating community:', req.params.id);
    console.log('Request body:', { name, slug, icon_url, cover_image_url });

    // Generate slug if not provided or invalid
    let finalSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Fallback to timestamp if slug is still empty
    if (!finalSlug || finalSlug === '') {
      finalSlug = `community-${Date.now()}`;
    }

    const [result] = await db.query(
      `UPDATE communities SET
        name = ?, slug = ?, description = ?, short_description = ?, category = ?,
        icon_url = ?, cover_image_url = ?, community_type = ?, rules = ?, status = ?
       WHERE id = ?`,
      [name, finalSlug, description, short_description, category, icon_url, cover_image_url, community_type, rules, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    console.log('Community updated successfully');
    res.json({ message: 'Community updated successfully' });
  } catch (error) {
    console.error('Failed to update community:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete community (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM communities WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }
    
    res.json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Failed to delete community:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
