const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/authorize');

// Get all orders (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order (admin+)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price as item_price, p.name as product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order (public - for customer orders)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { order_number, customer_name, customer_email, total_amount, status, shipping_address, items } = req.body;
    const [result] = await db.query(
      `INSERT INTO orders (order_number, customer_name, customer_email, total_amount, status, shipping_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_number, customer_name, customer_email, total_amount, status || 'pending', shipping_address]
    );
    
    const orderId = result.insertId;
    
    // Insert order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    res.status(201).json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin+)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
