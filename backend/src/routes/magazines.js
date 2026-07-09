const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadFields } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for magazines with S3 support
const uploadFieldsConfig = uploadFields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 },
  { name: 'preview_pages_file_0', maxCount: 1 },
  { name: 'preview_pages_file_1', maxCount: 1 },
  { name: 'preview_pages_file_2', maxCount: 1 }
], 'magazines', 50 * 1024 * 1024); // 50MB limit for PDFs

// Get all magazines (public read, editor+ for full access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name as category_name 
      FROM magazines m 
      LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single magazine (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name as category_name 
      FROM magazines m 
      LEFT JOIN categories c ON m.category_id = c.id 
      WHERE m.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Magazine not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create magazine (editor+)
router.post('/', authenticate, isEditor, uploadFieldsConfig, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);

    const {
      title, issue, category, description, pdf_url, price, digital_price, print_price,
      subscription_price, pages, language, publisher, rating, review_count,
      table_of_contents, contributors, preview_pages
    } = req.body;

    // Find files by fieldname from the object
    const coverImageFile = req.files?.['cover_image']?.[0];
    const pdfFile = req.files?.['pdf_file']?.[0];

    const cover_image_url = coverImageFile ? (coverImageFile.location || `/uploads/magazines/${coverImageFile.filename}`) : null;
    const pdf_file_url = pdfFile ? (pdfFile.location || `/uploads/magazines/${pdfFile.filename}`) : null;

    // Handle preview pages files
    const preview_pages_urls = [];
    for (let i = 0; i < 3; i++) {
      const fieldName = `preview_pages_file_${i}`;
      const file = req.files?.[fieldName]?.[0];
      if (file) {
        preview_pages_urls.push(file.location || `/uploads/magazines/${file.filename}`);
      }
    }

    const published_date = new Date().toISOString().split('T')[0];
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    console.log('Inserting magazine with data:', {
      title, issue, description, cover_image_url, category_id, published_date,
      pdf_url: pdf_file_url || pdf_url, price, digital_price, print_price,
      subscription_price, pages, language, publisher, rating, review_count,
      table_of_contents, contributors, preview_pages: preview_pages_urls.join(',')
    });

    const [result] = await db.query(
      `INSERT INTO magazines (title, issue, description, cover_image_url, category_id, published_date, pdf_url, price, digital_price, print_price, subscription_price, pages, language, publisher, rating, review_count, table_of_contents, contributors, preview_pages)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, issue, description || null, cover_image_url, category_id, published_date, pdf_file_url || pdf_url, price, digital_price, print_price, subscription_price, pages, language, publisher, rating, review_count, table_of_contents || null, contributors || null, preview_pages_urls.join(',') || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Magazine created successfully' });
  } catch (error) {
    console.error('Error creating magazine:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Update magazine (editor+)
router.put('/:id', authenticate, isEditor, uploadFieldsConfig, async (req, res) => {
  try {
    const {
      title, issue, category, description, pdf_url, price, digital_price, print_price,
      subscription_price, pages, language, publisher, rating, review_count,
      table_of_contents, contributors, preview_pages
    } = req.body;

    // Find files by fieldname from the object
    const coverImageFile = req.files?.['cover_image']?.[0];
    const pdfFile = req.files?.['pdf_file']?.[0];

    const cover_image_url = coverImageFile ? (coverImageFile.location || `/uploads/magazines/${coverImageFile.filename}`) : null;
    const pdf_file_url = pdfFile ? (pdfFile.location || `/uploads/magazines/${pdfFile.filename}`) : null;

    // Handle preview pages files
    const preview_pages_urls = [];
    for (let i = 0; i < 3; i++) {
      const fieldName = `preview_pages_file_${i}`;
      const file = req.files?.[fieldName]?.[0];
      if (file) {
        preview_pages_urls.push(file.location || `/uploads/magazines/${file.filename}`);
      }
    }

    // Get current magazine to preserve existing data if not being updated
    const [currentMagazine] = await db.query('SELECT * FROM magazines WHERE id = ?', [req.params.id]);
    const final_image_url = cover_image_url || currentMagazine[0]?.cover_image_url;
    const final_pdf_url = pdf_file_url || pdf_url || currentMagazine[0]?.pdf_url;
    const final_preview_pages = preview_pages_urls.length > 0 ? preview_pages_urls.join(',') : (preview_pages || currentMagazine[0]?.preview_pages);
    const final_description = description !== undefined ? description : currentMagazine[0]?.description;
    
    // Find category_id from category name
    let category_id = null;
    if (category) {
      const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
      if (categoryRows.length > 0) {
        category_id = categoryRows[0].id;
      }
    }
    
    const [result] = await db.query(
      `UPDATE magazines SET 
        title = ?, issue = ?, description = ?, cover_image_url = ?, category_id = ?, pdf_url = ?, 
        price = ?, digital_price = ?, print_price = ?, subscription_price = ?, 
        pages = ?, language = ?, publisher = ?, rating = ?, review_count = ?, 
        table_of_contents = ?, contributors = ?, preview_pages = ? 
       WHERE id = ?`,
      [
        title, issue, final_description, final_image_url, category_id, final_pdf_url,
        price, digital_price, print_price, subscription_price,
        pages, language, publisher, rating, review_count,
        table_of_contents, contributors, final_preview_pages,
        req.params.id
      ]
    );
    res.json({ message: 'Magazine updated successfully' });
  } catch (error) {
    console.error('Error updating magazine:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete magazine (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete magazines' });
    }
    await db.query('DELETE FROM magazines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Magazine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
