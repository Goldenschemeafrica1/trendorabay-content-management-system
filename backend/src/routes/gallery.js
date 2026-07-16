const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { isEditor } = require('../middleware/authorize');

// Get all gallery items (public)
router.get('/', async (req, res) => {
  try {
    // Check current database
    const [dbResult] = await db.query('SELECT DATABASE()');
    console.log('Current database:', dbResult[0]['DATABASE()']);
    
    // Check what tables exist in the database
    const [tables] = await db.query('SHOW TABLES');
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));

    const { category, featured } = req.query;
    let query = 'SELECT * FROM gallery';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    if (featured === '1' || featured === 'true') {
      const operator = params.length > 0 ? ' AND' : ' WHERE';
      query += `${operator} featured = 1`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single gallery item (public)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create gallery item (public)
router.post('/', async (req, res) => {
  try {
    const { title, image_url, caption, category, featured } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const [result] = await db.query(
      `INSERT INTO gallery (title, image_url, caption, category, featured) 
       VALUES (?, ?, ?, ?, ?)`,
      [title || 'Untitled', image_url, caption || null, category || null, featured || 0]
    );
    
    const [newItem] = await db.query('SELECT * FROM gallery WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Gallery item created successfully', 
      data: newItem[0] 
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update gallery item (editor and above)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { title, image_url, caption, category, featured } = req.body;
    
    const [existing] = await db.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    await db.query(
      `UPDATE gallery SET title = ?, image_url = ?, caption = ?, category = ?, featured = ? 
       WHERE id = ?`,
      [
        title || existing[0].title,
        image_url || existing[0].image_url,
        caption !== undefined ? caption : existing[0].caption,
        category !== undefined ? category : existing[0].category,
        featured !== undefined ? featured : existing[0].featured,
        req.params.id
      ]
    );
    
    const [updated] = await db.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    
    res.json({ 
      message: 'Gallery item updated successfully', 
      data: updated[0] 
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete gallery item (public)
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM gallery WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    
    await db.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
