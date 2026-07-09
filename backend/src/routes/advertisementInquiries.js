const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, hasRole } = require('../middleware/authorize');

// Get all advertisement inquiries (admin+)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM advertisement_inquiries ORDER BY created_at DESC');
    console.log('Raw database rows:', JSON.stringify(rows, null, 2));
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      name: row.name || row.contact_name,
      email: row.email || row.contact_email,
      phone: row.phone || row.contact_phone,
      company: row.company || row.company_name,
      budget_range: row.budget || row.budget_range,
      preferred_duration: row.campaign_type || row.preferred_duration,
      inquiryDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
    }));
    console.log('Mapped rows:', JSON.stringify(mappedRows, null, 2));
    res.json(mappedRows);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create advertisement inquiry (public - for external inquiries)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      contact_name, 
      contact_email, 
      contact_phone, 
      company_name, 
      message, 
      budget_range, 
      preferred_duration, 
      status 
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO advertisement_inquiries (contact_name, contact_email, contact_phone, company_name, message, budget_range, preferred_duration, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contact_name, 
        contact_email, 
        contact_phone, 
        company_name, 
        message, 
        budget_range, 
        preferred_duration, 
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Advertisement inquiry created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update advertisement inquiry (admin+)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      contact_name, 
      contact_email, 
      contact_phone, 
      company_name, 
      message, 
      budget_range, 
      preferred_duration, 
      status 
    } = req.body;
    await db.query(
      `UPDATE advertisement_inquiries SET contact_name = ?, contact_email = ?, contact_phone = ?, company_name = ?, message = ?, budget_range = ?, preferred_duration = ?, status = ? WHERE id = ?`,
      [
        contact_name, 
        contact_email, 
        contact_phone, 
        company_name, 
        message, 
        budget_range, 
        preferred_duration, 
        status,
        req.params.id
      ]
    );
    res.json({ message: 'Advertisement inquiry updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete advertisement inquiry (admin+)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM advertisement_inquiries WHERE id = ?', [req.params.id]);
    res.json({ message: 'Advertisement inquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
