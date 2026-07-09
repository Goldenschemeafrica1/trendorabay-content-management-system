const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { uploadSingle } = require('../config/upload');
const { deleteFromS3 } = require('../config/s3');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Configure upload for products with S3 support
const upload = uploadSingle('image', 'products', 5 * 1024 * 1024); // 5MB limit for product images

// Upload product image (editor+)
router.post('/upload', authenticate, isEditor, upload, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = req.file ? (req.file.location || `/uploads/products/${req.file.filename}`) : null;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get best-selling products (public read)
router.get('/best-selling', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY total_sold DESC, p.created_at DESC
      LIMIT 4
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product (public read)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category, status } = req.body;
    const [result] = await db.query(
      `INSERT INTO products (name, description, price, stock, image_url, category, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock, image_url, category, status || 'active']
    );
    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, description, price, stock, image_url, category, status } = req.body;
    console.log('Update product request body:', req.body);
    console.log('Product ID:', req.params.id);
    
    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, image_url = ?, category = ?, status = ? 
       WHERE id = ?`,
      [name, description, price, stock, image_url, category, status, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete products' });
    }
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
