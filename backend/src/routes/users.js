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
    const [rows] = await db.query('SELECT id, username, first_name, last_name, email, role, profile_image_url, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single user (admin or own idValidation, user)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Allow if admin or if requesting own profile
    if (!hasRole(req.user.role, 'admin') && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const [rows] = await db.query('SELECT id, username, first_name, last_name, email, role, profile_image_url, created_at FROM users WHERE id = ?', [req.params.id]);
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

// Update user (admin or own useridValidation, updateUserValidation, )
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, email, role, profile_image_url, password } = req.body;
    
    // Check permissions
    const isOwnProfile = req.user.id === parseInt(req.params.id);
    const isAdminUser = hasRole(req.user.role, 'admin');
    
    if (!isOwfile && !isAdminUser) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Non-admins can only update their own name and profile image
    if (!isAdminUser) {
      const [result] = await db.query(
        `UPDATE users 
         SET name = ?, profile_image_url = ? 
         WHERE id = ?`,
        [name, profile_image_url, req.params.id]
      );
      res.json({ message: 'User updated successfully' });
      return;
    }
    
    // Admins can update more fields
    const validRoles = ['admin', 'user', 'contributor', 'superadmin', 'editor'];
    const userRole = validRoles.includes(role) ? role : 'user';
    
    // Only superadmin can assign superadmin role
    if (userRole === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmin can assign superadmin role' });
    }
    
    // Prevent admin from demoting themselves or other admins (unless superadmin)
    if (req.user.role === 'admin' && userRole !== 'admin' && parseInt(req.params.id) === req.user.id) {
      return res.status(403).json({ error: 'Cannot demote yourself' });
    }
    
    // Get the cms_user_iduser
    const [userRecord] = await db.query('SELECT cms_user_id FROM users WHERE id = ?', [req.params.id]);
    const cmsUserId = userRecord.length > 0 ? userRecord[0].cms_user_id : null;
    user
    // Update users table
    let query, params;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      query = `UPDATE users SET name = ?, email = ?, role = ?, profile_image_url = ? WHERE id = ?`;
      params = [name, email, userRole, profile_image_url, req.params.id];
    } else {
      query = `UPDATE users SET name = ?, email = ?, role = ?, profile_image_url = ? WHERE id = ?`;
      params = [name, email, userRole, profile_image_url, req.params.id];
    }
    
    await db.query(query, params);
    
    // Also update cms_users table if cms_user_id exists
    if (cmsUserId) {
      if (password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await db.query(
          `UPDATE cms_users SET name = ?, email = ?, role = ?, profile_image_url = ?, password = ? WHERE id = ?`,
          [name, email, userRole, profile_image_url, hashedPassword, cmsUserId]
        );
      } else {
        await db.query(
          `UPDATE cms_users SET name = ?, email = ?, role = ?, profile_image_url = ? WHERE id = ?`,
          [name, email, userRole, profile_image_url, cmsUserId]
        );
      }
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (superadmin only)idValidation, 
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
