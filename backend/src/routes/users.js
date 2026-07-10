const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isSuperAdmin, hasRole } = require('../middleware/authorize');
const { updateUserValidation, idValidation } = require('../middleware/validation');

const SALT_ROUNDS = 10;

// Get all users (admin only)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id as cms_user_id,
        c.name,
        c.email,
        c.role,
        c.status,
        c.profile_image_url,
        c.last_active,
        c.created_at as cms_created_at,
        c.updated_at as cms_updated_at,
        u.id as users_table_id,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at as users_created_at,
        u.updated_at as users_updated_at
      FROM cms_users c
      LEFT JOIN users u ON c.id = u.cms_user_id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single user (admin or own profile)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Allow if admin or if requesting own profile
    if (!hasRole(req.user.role, 'admin') && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [rows] = await db.query(`
      SELECT 
        c.id as cms_user_id,
        c.name,
        c.email,
        c.role,
        c.status,
        c.profile_image_url,
        c.last_active,
        c.created_at as cms_created_at,
        c.updated_at as cms_updated_at,
        u.id as users_table_id,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at as users_created_at,
        u.updated_at as users_updated_at
      FROM cms_users c
      LEFT JOIN users u ON c.id = u.cms_user_id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Validate role
    const validRoles = ['admin', 'user', 'contributor', 'superadmin', 'editor'];
    const userRole = validRoles.includes(role) ? role : 'user';
    
    // Only superadmin can create superadmin
    if (userRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmin can create superadmin users' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert into cms_users first (for login)
    const [cmsResult] = await db.query(
      `INSERT INTO cms_users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, userRole]
    );
    
    // Then insert into users table (for user management)
    const [result] = await db.query(
      `INSERT INTO users (cms_user_id, username, email, role) 
       VALUES (?, ?, ?, ?)`,
      [cmsResult.insertId, name, email, userRole]
    );
    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin or own profile)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, email, role, profile_image_url, password } = req.body;
    const cmsUserId = parseInt(req.params.id);
    
    // Check permissions
    const isOwnProfile = req.user.id === cmsUserId;
    const isAdminUser = hasRole(req.user.role, 'admin');
    
    if (!isOwnProfile && !isAdminUser) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Admins can update more fields
    const validRoles = ['admin', 'user', 'contributor', 'superadmin', 'editor'];
    const userRole = validRoles.includes(role) ? role : 'user';
    
    // Only superadmin can assign superadmin role
    if (userRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmin can assign superadmin role' });
    }
    
    // Prevent admin from demoting themselves (unless superadmin)
    if (req.user.role === 'admin' && userRole !== 'admin' && cmsUserId === req.user.id) {
      return res.status(403).json({ error: 'Cannot demote yourself' });
    }
    
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(userRole);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (profile_image_url !== undefined) {
      updateFields.push('profile_image_url = ?');
      updateValues.push(profile_image_url);
    }
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(cmsUserId);
    
    // Update cms_users table (primary source of truth)
    await db.query(
      `UPDATE cms_users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Also update users table if it has a corresponding entry
    const [userRecord] = await db.query('SELECT id FROM users WHERE cms_user_id = ?', [cmsUserId]);
    if (userRecord.length > 0) {
      const usersTableId = userRecord[0].id;
      const usersUpdateFields = [];
      const usersUpdateValues = [];
      
      if (role !== undefined) {
        usersUpdateFields.push('role = ?');
        usersUpdateValues.push(userRole);
      }
      if (email !== undefined) {
        usersUpdateFields.push('email = ?');
        usersUpdateValues.push(email);
      }
      if (profile_image_url !== undefined) {
        usersUpdateFields.push('profile_image_url = ?');
        usersUpdateValues.push(profile_image_url);
      }
      if (name !== undefined) {
        usersUpdateFields.push('username = ?');
        usersUpdateValues.push(name);
      }
      
      usersUpdateValues.push(usersTableId);
      
      await db.query(
        `UPDATE users SET ${usersUpdateFields.join(', ')} WHERE id = ?`,
        usersUpdateValues
      );
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (superadmin only)
router.delete('/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Get the cms_user_id before deleting
    const [userToDelete] = await db.query('SELECT cms_user_id FROM users WHERE id = ?', [req.params.id]);
    
    // Delete from users table
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    
    // Also delete from cms_users if cms_user_id exists
    if (userToDelete.length > 0 && userToDelete[0].cms_user_id) {
      await db.query('DELETE FROM cms_users WHERE id = ?', [userToDelete[0].cms_user_id]);
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
