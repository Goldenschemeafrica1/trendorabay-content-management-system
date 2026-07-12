const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, hasRole } = require('../middleware/authorize');

// Get all partnership inquiries (editor+)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partnership_inquiries ORDER BY created_at DESC');
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      name: row.contact_name,
      email: row.contact_email,
      phone: row.contact_phone,
      company: row.company_name,
      website: row.website_url,
      inquiryDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
    }));
    res.json(mappedRows);
  } catch (error) {
    console.error('Error fetching partnership inquiries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create partnership inquiry (public - for external inquiries)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      contact_name, 
      contact_email, 
      contact_phone, 
      company_name, 
      website_url,
      message, 
      partnership_type, 
      status 
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO partnership_inquiries (contact_name, contact_email, contact_phone, company_name, website_url, message, partnership_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contact_name, 
        contact_email, 
        contact_phone, 
        company_name, 
        website_url,
        message, 
        partnership_type, 
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Partnership inquiry created successfully' });
  } catch (error) {
    console.error('Error creating partnership inquiry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update partnership inquiry (editor+)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { 
      contact_name, 
      contact_email, 
      contact_phone, 
      company_name, 
      website_url,
      message, 
      partnership_type, 
      status,
      admin_notes
    } = req.body;
    await db.query(
      `UPDATE partnership_inquiries SET contact_name = ?, contact_email = ?, contact_phone = ?, company_name = ?, website_url = ?, message = ?, partnership_type = ?, status = ?, admin_notes = ? WHERE id = ?`,
      [
        contact_name, 
        contact_email, 
        contact_phone, 
        company_name, 
        website_url,
        message, 
        partnership_type, 
        status,
        admin_notes,
        req.params.id
      ]
    );
    res.json({ message: 'Partnership inquiry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete partnership inquiry (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete partnership inquiries' });
    }
    await db.query('DELETE FROM partnership_inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Partnership inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
