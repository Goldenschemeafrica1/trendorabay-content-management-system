const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isEditor, hasRole } = require('../middleware/authorize');

// Get all partners (public read)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM partners ORDER BY created_at DESC');
    // Map database fields to match frontend expectations
    const mappedRows = rows.map(row => ({
      ...row,
      website: row.website_url,
      contact: row.contact_email,
      joined: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : null
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create partner (editor+)
router.post('/', authenticate, isEditor, async (req, res) => {
  try {
    console.log('Received partner data:', JSON.stringify(req.body, null, 2));
    const { name, website, contact, status, logo_url, website_url, contact_email } = req.body;
    const [result] = await db.query(
      `INSERT INTO partners (name, logo_url, website_url, contact_email, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        name, 
        logo_url || null, 
        website_url || website || null, 
        contact_email || contact || null, 
        status || 'active'
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Partner created successfully' });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update partner (editor+)
router.put('/:id', authenticate, isEditor, async (req, res) => {
  try {
    const { name, website, contact, status, logo_url, website_url, contact_email } = req.body;
    await db.query(
      `UPDATE partners SET name = ?, logo_url = ?, website_url = ?, contact_email = ?, status = ? WHERE id = ?`,
      [
        name, 
        logo_url || null, 
        website_url || website || null, 
        contact_email || contact || null, 
        status, 
        req.params.id
      ]
    );
    res.json({ message: 'Partner updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete partner (admin+)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (!hasRole(req.user.role, 'admin')) {
      return res.status(403).json({ error: 'Admin access required to delete partners' });
    }
    await db.query('DELETE FROM partners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
