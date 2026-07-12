const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin, hasRole } = require('../middleware/authorize');

// Get all partnership proposals (editor+)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partnership_proposals ORDER BY created_at DESC');
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      name: row.contact_person,
      email: row.email,
      phone: row.phone,
      company: row.company_name,
      inquiryDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
    }));
    res.json(mappedRows);
  } catch (error) {
    console.error('Error fetching partnership proposals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create partnership proposal (public - for external inquiries)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { 
      company_name, 
      contact_person, 
      email, 
      phone, 
      partnership_type, 
      message, 
      status 
    } = req.body;
    const [result] = await db.query(
      `INSERT INTO partnership_proposals (company_name, contact_person, email, phone, partnership_type, message, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name, 
        contact_person, 
        email, 
        phone, 
        partnership_type, 
        message, 
        status || 'pending'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Partnership proposal created successfully' });
  } catch (error) {
    console.error('Error creating partnership proposal:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update partnership proposal (editor+)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { 
      company_name, 
      contact_person, 
      email, 
      phone, 
      partnership_type, 
      message, 
      status
    } = req.body;
    await db.query(
      `UPDATE partnership_proposals SET company_name = ?, contact_person = ?, email = ?, phone = ?, partnership_type = ?, message = ?, status = ? WHERE id = ?`,
      [
        company_name, 
        contact_person, 
        email, 
        phone, 
        partnership_type, 
        message, 
        status,
        req.params.id
      ]
    );
    res.json({ message: 'Partnership proposal updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete partnership proposal (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete partnership proposals' });
    }
    await db.query('DELETE FROM partnership_proposals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Partnership proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
