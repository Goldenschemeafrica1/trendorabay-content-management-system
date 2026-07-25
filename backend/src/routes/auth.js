const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../middleware/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM cms_users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Validate role (default to 'superadmin' if not provided or invalid)
    const validRoles = ['admin', 'user', 'contributor', 'superadmin', 'editor'];
    const userRole = validRoles.includes(role) ? role : 'superadmin';
    
    // Insert new user into cms_users
    const [result] = await db.query(
      `INSERT INTO cms_users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, userRole]
    );
    
    // Also insert into users table for user management
    await db.query(
      `INSERT INTO users (cms_user_id, username, email, role) 
       VALUES (?, ?, ?, ?)`,
      [result.insertId, name, email, userRole]
    );
    
    // Get the created user
    const [newUser] = await db.query(
      'SELECT id, name, email, role FROM cms_users WHERE id = ?',
      [result.insertId]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].id, role: newUser[0].role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: newUser[0].id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Store refresh token in database
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
      'UPDATE cms_users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [refreshToken, refreshExpiresAt, newUser[0].id]
    );
    
    res.status(201).json({ 
      user: newUser[0],
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    
    // Find user by email (select only needed fields)
    const [users] = await db.query(
      'SELECT id, name, email, password, role, status, profile_image_url, last_active, created_at FROM cms_users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Account is banned' });
    }
    
    // Check password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last_active
    try {
      await db.query(
        'UPDATE cms_users SET last_active = NOW() WHERE id = ?',
        [user.id]
      );
    } catch (err) {
      // Ignore if last_active column doesn't exist
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Store refresh token in database
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
      'UPDATE cms_users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [refreshToken, refreshExpiresAt, user.id]
    );
    
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profile_image_url: user.profile_image_url,
        last_active: user.last_active,
        created_at: user.created_at
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get fresh user data
      const [users] = await db.query(
        'SELECT id, name, email, role, status, profile_image_url, last_active, created_at FROM cms_users WHERE id = ?',
        [decoded.userId]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const user = users[0];
      
      if (user.status === 'banned') {
        return res.status(403).json({ error: 'Account is banned' });
      }
      
      res.json({ user });
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    // Find user with this refresh token
    const [users] = await db.query(
      'SELECT id, name, email, role, status, refresh_token_expires_at FROM cms_users WHERE refresh_token = ?',
      [refreshToken]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const user = users[0];
    
    // Check if refresh token is expired
    if (user.refresh_token_expires_at && new Date(user.refresh_token_expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    
    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Account is banned' });
    }
    
    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generate new refresh token (7 days)
    const newRefreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update refresh token in database
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.query(
      'UPDATE cms_users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [newRefreshToken, refreshExpiresAt, user.id]
    );
    
    res.json({ 
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

module.exports = router;
