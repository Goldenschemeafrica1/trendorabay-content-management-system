const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');
const { storyValidation, storyIdValidation } = require('../middleware/validation');

// Configure upload for stories with S3 support
const upload = uploadSingle('cover_image', 'stories', 5 * 1024 * 1024); // 5MB limit for images

// Get all stories (public read, editor+ for full access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, a.name as author_name, c.name as category_name 
      FROM stories s 
      LEFT JOIN authors a ON s.author_id = a.id 
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `);
    
    // Non-authenticated users only see published stories
    if (!req.user) {
      const publishedStories = rows.filter(s => s.status === 'published');
      return res.json(publishedStories);
    }
    
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single story (public read for published, editor+ for all)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, a.name as author_name, c.name as category_name 
      FROM stories s 
      LEFT JOIN authors a ON s.author_id = a.id 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const story = rows[0];
    
    // Non-authenticated users can only see published stories
    if (!req.user && story.status !== 'published') {
      return res.status(403).json({ error: 'Story not published' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create story (editor+)
router.post('/', authenticate, isEditor, upload, storyValidation, async (req, res) => {
  try {
    const { title, author_id, category, content, status, featured, read_time } = req.body;
    
    console.log('Creating story with data:', { title, author_id, category, contentLength: content?.length, status, featured, read_time });
    
    const featured_image_url = req.file ? (req.file.location || `/uploads/stories/${req.file.filename}`) : null;
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    // Set published_at if status is published
    const published_at = status === 'published' ? new Date() : null;
    
    // Convert featured to boolean
    const featuredValue = featured === 'true' || featured === true ? 1 : 0;
    
    console.log('Inserting story with:', { title, category_id, author_id, status, featuredValue, read_time });
    
    const [result] = await db.query(
      `INSERT INTO stories (title, content, featured_image_url, author_id, category_id, status, featured, published_at, read_time, views) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, featured_image_url, author_id, category_id, status, featuredValue, published_at, read_time || '5 min read', 0]
    );
    
    console.log('Story created successfully with ID:', result.insertId);
    res.status(201).json({ id: result.insertId, message: 'Story created successfully' });
  } catch (error) {
    console.error('Error creating story:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update story (editor+)
router.put('/:id', authenticate, isEditor, storyIdValidation, upload, storyValidation, async (req, res) => {
  try {
    const { title, author_id, category, content, status, featured, read_time } = req.body;
    const featured_image_url = req.file ? (req.file.location || `/uploads/stories/${req.file.filename}`) : null;
    
    // Get current story to preserve existing image if no new one is uploaded
    const [currentStory] = await db.query('SELECT featured_image_url, published_at FROM stories WHERE id = ?', [req.params.id]);
    const final_image_url = featured_image_url || currentStory[0]?.featured_image_url;
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    // Set published_at if status is changing to published and it wasn't before
    let published_at = currentStory[0]?.published_at;
    if (status === 'published' && !published_at) {
      published_at = new Date();
    }
    
    // Convert featured to boolean
    const featuredValue = featured === 'true' || featured === true ? 1 : 0;
    
    // Build update query dynamically based on whether image is being updated
    let query, params;
    if (featured_image_url) {
      query = `UPDATE stories SET title = ?, content = ?, featured_image_url = ?, author_id = ?, category_id = ?, status = ?, featured = ?, published_at = ?, read_time = ? WHERE id = ?`;
      params = [title, content, final_image_url, author_id, category_id, status, featuredValue, published_at, read_time || '5 min read', req.params.id];
    } else {
      query = `UPDATE stories SET title = ?, content = ?, author_id = ?, category_id = ?, status = ?, featured = ?, published_at = ?, read_time = ? WHERE id = ?`;
      params = [title, content, author_id, category_id, status, featuredValue, published_at, read_time || '5 min read', req.params.id];
    }
    
    await db.query(query, params);
    res.json({ message: 'Story updated successfully' });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete story (admin+)
router.delete('/:id', authenticate, storyIdValidation, async (req, res) => {
  try {
    // Only admin and above can delete
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete stories' });
    }
    
    await db.query('DELETE FROM stories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

