const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware - verifies JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get fresh user data from database
      const [users] = await db.query(
        'SELECT id, name, email, role, status FROM cms_users WHERE id = ?',
        [decoded.userId]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const user = users[0];
      
      if (user.status === 'banned') {
        return res.status(403).json({ error: 'User account is banned' });
      }
      
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const [users] = await db.query(
        'SELECT id, name, email, role, status FROM cms_users WHERE id = ?',
        [decoded.userId]
      );
      
      if (users.length > 0 && users[0].status !== 'banned') {
        req.user = users[0];
      }
    } catch (jwtError) {
      // Ignore invalid token for optional auth
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
