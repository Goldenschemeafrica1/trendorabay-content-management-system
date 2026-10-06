const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle, uploadFields, uploadFileToCloud, useCloudinary } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');
const { storyValidation, storyIdValidation } = require('../middleware/validation');
const { logAuditEvent } = require('../middleware/securityLogger');

const slugify = (text) => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Configure upload for stories with multiple image support
const upload = uploadFields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'cover_image_2', maxCount: 1 },
  { name: 'cover_image_3', maxCount: 1 },
  { name: 'cover_image_4', maxCount: 1 }
], 'stories', 5 * 1024 * 1024); // 5MB limit for images

// Get all stories (public read, editor+ for full access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { section } = req.query;

    let whereClause = '';

    // Handle display section filtering
    if (section && section !== 'all') {
      // Convert section names to database values
      const sectionMap = {
        'latest_stories': 'latest_stories',
        'must_read': 'must_read',
        'innovation': 'innovation'
      };
      const dbSection = sectionMap[section] || section;
      whereClause += ` AND s.display_section = '${dbSection}'`;
    }

    const [rows] = await db.query(`
      SELECT s.*, a.name as author_name, c.name as category_name
      FROM stories s
      LEFT JOIN authors a ON s.author_id = a.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE 1=1 ${whereClause}
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
    console.log('Story create request received');
    console.log('Files:', req.files);
    console.log('Use Cloudinary:', useCloudinary);
    
    const { title, author_id, category, content, status, featured, read_time, display_section, display_order, priority, display_start_date, display_end_date, is_pinned } = req.body;

    console.log('Creating story with data:', { title, author_id, category, contentLength: content?.length, status, featured, read_time, display_section, display_order, priority, is_pinned });

    // Handle read_time - use provided value or default
    const finalReadTime = read_time && read_time.trim() !== '' ? read_time.trim() : '5 min read';
    
    // Handle multiple image uploads
    const imageFields = ['cover_image', 'cover_image_2', 'cover_image_3', 'cover_image_4'];
    const imageUrls = {};
    
    for (const fieldName of imageFields) {
      const file = req.files?.[fieldName]?.[0];
      if (file) {
        if (useCloudinary) {
          console.log(`Uploading ${fieldName} to Cloudinary...`);
          imageUrls[fieldName] = await uploadFileToCloud(file, 'stories');
          console.log(`Cloudinary upload result for ${fieldName}:`, imageUrls[fieldName]);
        } else {
          console.log(`Using local storage for ${fieldName}`);
          imageUrls[fieldName] = file.location || `/uploads/stories/${file.filename}`;
        }
      } else {
        imageUrls[fieldName] = null;
      }
    }
    
    console.log('Final image URLs:', imageUrls);
    
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
    const isPinnedValue = is_pinned === 'true' || is_pinned === true ? 1 : 0;

    // Generate slug from title
    const slug = `${slugify(title)}-${Date.now()}`;

    console.log('Inserting story with:', { title, slug, category_id, author_id, status, featuredValue, finalReadTime, display_section, display_order, priority, isPinnedValue });

    const [result] = await db.query(
      `INSERT INTO stories (title, slug, content, featured_image_url, featured_image_url_2, featured_image_url_3, featured_image_url_4, author_id, category_id, status, featured, published_at, read_time, views, display_section, display_order, priority, display_start_date, display_end_date, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, imageUrls.cover_image, imageUrls.cover_image_2, imageUrls.cover_image_3, imageUrls.cover_image_4, author_id, category_id, status, featuredValue, published_at, finalReadTime, 0, display_section || 'default', display_order || 0, priority || 0, display_start_date || null, display_end_date || null, isPinnedValue]
    );
    
    console.log('Story created successfully with ID:', result.insertId);
    res.status(201).json({ id: result.insertId, message: 'Story created successfully' });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Update story (editor+)
router.put('/:id', authenticate, isEditor, storyIdValidation, upload, storyValidation, async (req, res) => {
  try {
    console.log('Story update request received');
    console.log('Files:', req.files);
    console.log('Use Cloudinary:', useCloudinary);

    const { title, author_id, category, content, status, featured, read_time, display_section, display_order, priority, display_start_date, display_end_date, is_pinned } = req.body;

    // Handle read_time - use provided value or default
    const finalReadTime = read_time && read_time.trim() !== '' ? read_time.trim() : '5 min read';
    
    // Handle multiple image uploads
    const imageFields = ['cover_image', 'cover_image_2', 'cover_image_3', 'cover_image_4'];
    const imageUrls = {};
    
    for (const fieldName of imageFields) {
      const file = req.files?.[fieldName]?.[0];
      if (file) {
        if (useCloudinary) {
          console.log(`Uploading ${fieldName} to Cloudinary...`);
          imageUrls[fieldName] = await uploadFileToCloud(file, 'stories');
          console.log(`Cloudinary upload result for ${fieldName}:`, imageUrls[fieldName]);
        } else {
          console.log(`Using local storage for ${fieldName}`);
          imageUrls[fieldName] = file.location || `/uploads/stories/${file.filename}`;
        }
      } else {
        imageUrls[fieldName] = null;
      }
    }
    
    console.log('Final image URLs:', imageUrls);
    
    // Get current story to preserve existing images if no new ones are uploaded
    const [currentStory] = await db.query('SELECT featured_image_url, featured_image_url_2, featured_image_url_3, featured_image_url_4, published_at FROM stories WHERE id = ?', [req.params.id]);
    
    const final_image_url = imageUrls.cover_image || currentStory[0]?.featured_image_url;
    const final_image_url_2 = imageUrls.cover_image_2 || currentStory[0]?.featured_image_url_2;
    const final_image_url_3 = imageUrls.cover_image_3 || currentStory[0]?.featured_image_url_3;
    const final_image_url_4 = imageUrls.cover_image_4 || currentStory[0]?.featured_image_url_4;
    
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
    const isPinnedValue = is_pinned === 'true' || is_pinned === true ? 1 : 0;

    // Regenerate slug from title
    const slug = `${slugify(title)}-${Date.now()}`;

    // Build update query
    const query = `UPDATE stories SET title = ?, slug = ?, content = ?, featured_image_url = ?, featured_image_url_2 = ?, featured_image_url_3 = ?, featured_image_url_4 = ?, author_id = ?, category_id = ?, status = ?, featured = ?, published_at = ?, read_time = ?, display_section = ?, display_order = ?, priority = ?, display_start_date = ?, display_end_date = ?, is_pinned = ? WHERE id = ?`;
    const params = [title, slug, content, final_image_url, final_image_url_2, final_image_url_3, final_image_url_4, author_id, category_id, status, featuredValue, published_at, finalReadTime, display_section || 'default', display_order || 0, priority || 0, display_start_date || null, display_end_date || null, isPinnedValue, req.params.id];
    
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

    // Get story details before deletion for audit logging
    const [storyToDelete] = await db.query('SELECT id, title FROM stories WHERE id = ?', [req.params.id]);

    await db.query('DELETE FROM stories WHERE id = ?', [req.params.id]);

    // Log audit event
    await logAuditEvent(
      'STORY_DELETED',
      'story',
      req.params.id,
      { ...req.user, req },
      storyToDelete.length > 0 ? { title: storyToDelete[0].title } : null,
      null
    );

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder stories (editor+)
router.put('/reorder', authenticate, isEditor, async (req, res) => {
  try {
    const { stories } = req.body; // Array of { id, display_order }

    if (!Array.isArray(stories)) {
      return res.status(400).json({ error: 'Stories must be an array' });
    }

    // Update display_order for each story
    for (const story of stories) {
      if (story.id && story.display_order !== undefined) {
        await db.query(
          'UPDATE stories SET display_order = ? WHERE id = ?',
          [story.display_order, story.id]
        );
      }
    }

    res.json({ message: 'Stories reordered successfully' });
  } catch (error) {
    console.error('Error reordering stories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update story display settings (editor+)
router.patch('/:id/display', authenticate, isEditor, storyIdValidation, async (req, res) => {
  try {
    const { display_section, display_order, priority, is_pinned } = req.body;

    const isPinnedValue = is_pinned === 'true' || is_pinned === true ? 1 : 0;

    await db.query(
      `UPDATE stories SET display_section = ?, display_order = ?, priority = ?, is_pinned = ? WHERE id = ?`,
      [display_section || 'default', display_order || 0, priority || 0, isPinnedValue, req.params.id]
    );

    res.json({ message: 'Display settings updated successfully' });
  } catch (error) {
    console.error('Error updating display settings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

