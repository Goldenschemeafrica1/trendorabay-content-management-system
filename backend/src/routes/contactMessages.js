const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, hasRole } = require('../middleware/authorize');

// Get all contact messages (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contact message (admin+)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create contact message (public - for contact form)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, subject, message, status } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name, 
        email, 
        phone || null, 
        subject || null, 
        message, 
        status || 'unread'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Contact message created successfully' });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact message (admin+)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, subject, message, status, admin_notes } = req.body;
    
    await db.query(
      `UPDATE contact_messages 
       SET name = ?, email = ?, phone = ?, subject = ?, message = ?, status = ?, admin_notes = ? 
       WHERE id = ?`,
      [
        name, 
        email, 
        phone || null, 
        subject || null, 
        message, 
        status, 
        admin_notes || null,
        req.params.id
      ]
    );
    res.json({ message: 'Contact message updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status only (admin+)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Contact message status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contact message (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
