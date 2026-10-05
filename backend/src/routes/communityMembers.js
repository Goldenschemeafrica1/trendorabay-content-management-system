const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Get all members of a community
router.get('/community/:communityId', authenticate, async (req, res) => {
  try {
    const { communityId } = req.params;
    console.log('Fetching members for community:', communityId);

    const [rows] = await db.query(`
      SELECT cm.*, u.username, u.email, u.profile_image_url,
             CONCAT(u.first_name, ' ', u.last_name) as name
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ? AND cm.status != 'left'
      ORDER BY cm.joined_at DESC
    `, [communityId]);

    console.log('Found members:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch community members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a member to a community
router.post('/', authenticate, async (req, res) => {
  try {
    const { community_id, user_id, role } = req.body;
    
    if (!community_id || !user_id) {
      return res.status(400).json({ error: 'Community ID and User ID are required' });
    }
    
    const [result] = await db.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES (?, ?, ?)`,
      [community_id, user_id, role || 'member']
    );
    
    res.status(201).json({ id: result.insertId, message: 'Member added successfully' });
  } catch (error) {
    console.error('Failed to add community member:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'User is already a member of this community' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update member role
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { role, status } = req.body;
    
    const [result] = await db.query(
      `UPDATE community_members SET role = ?, status = ? WHERE id = ?`,
      [role, status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Failed to update community member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove a member from a community
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM community_members WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Failed to remove community member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's communities
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(`
      SELECT cm.*, c.name as community_name, c.slug, c.icon_url
      FROM community_members cm
      JOIN communities c ON cm.community_id = c.id
      WHERE cm.user_id = ?
      ORDER BY cm.joined_at DESC
    `, [userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch user communities:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
