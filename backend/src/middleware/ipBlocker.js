const db = require('../config/database');

/**
 * IP Blocking Middleware for Failed Authentication Attempts
 * Tracks failed login attempts and blocks IPs after threshold is reached
 */

// Configuration (can be overridden by environment variables)
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS) || 5;
const BLOCK_DURATION_MINUTES = parseInt(process.env.BLOCK_DURATION_MINUTES) || 30;
const ATTEMPT_WINDOW_MINUTES = parseInt(process.env.ATTEMPT_WINDOW_MINUTES) || 15;

/**
 * Initialize blocked_ips table on startup
 */
const initializeBlockTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE,
        blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        failed_attempts INT DEFAULT 0,
        last_attempt_at TIMESTAMP NULL,
        reason VARCHAR(255),
        unblocked_at TIMESTAMP NULL,
        unblocked_by INT NULL,
        INDEX idx_ip_address (ip_address),
        INDEX idx_expires_at (expires_at),
        INDEX idx_blocked_at (blocked_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.query(createTableQuery);
    console.log('✅ Blocked IPs table initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize blocked_ips table:', error.message);
  }
};

// Initialize table on module load
initializeBlockTable();

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

/**
 * Check if IP is currently blocked
 */
const isIpBlocked = async (ipAddress) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM blocked_ips WHERE ip_address = ? AND expires_at > NOW() AND unblocked_at IS NULL',
      [ipAddress]
    );
    return rows.length > 0;
  } catch (error) {
    console.error('Error checking IP block status:', error);
    return false;
  }
};

/**
 * Record failed authentication attempt
 */
const recordFailedAttempt = async (ipAddress, reason = 'Authentication failed') => {
  try {
    const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MINUTES * 60 * 1000);
    
    // Check for existing record
    const [existing] = await db.query(
      'SELECT * FROM blocked_ips WHERE ip_address = ? AND (expires_at > NOW() OR unblocked_at IS NULL)',
      [ipAddress]
    );

    if (existing.length > 0) {
      const record = existing[0];
      
      // If already blocked, just update last attempt
      if (record.expires_at > new Date() && !record.unblocked_at) {
        await db.query(
          'UPDATE blocked_ips SET last_attempt_at = NOW(), failed_attempts = failed_attempts + 1 WHERE id = ?',
          [record.id]
        );
        return { blocked: true, remainingTime: record.expires_at };
      }
      
      // If not currently blocked, increment attempts
      const newAttempts = record.failed_attempts + 1;
      
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Block the IP
        const expiresAt = new Date(Date.now() + BLOCK_DURATION_MINUTES * 60 * 1000);
        await db.query(
          'UPDATE blocked_ips SET failed_attempts = ?, blocked_at = NOW(), expires_at = ?, last_attempt_at = NOW(), reason = ?, unblocked_at = NULL WHERE id = ?',
          [newAttempts, expiresAt, reason, record.id]
        );
        return { blocked: true, newlyBlocked: true, expiresAt };
      } else {
        // Just increment attempts
        await db.query(
          'UPDATE blocked_ips SET failed_attempts = ?, last_attempt_at = NOW() WHERE id = ?',
          [newAttempts, record.id]
        );
        return { blocked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - newAttempts };
      }
    } else {
      // Create new record
      await db.query(
        'INSERT INTO blocked_ips (ip_address, failed_attempts, last_attempt_at, reason, expires_at) VALUES (?, 1, NOW(), ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
        [ipAddress, reason, BLOCK_DURATION_MINUTES]
      );
      return { blocked: false, attemptsRemaining: MAX_FAILED_ATTEMPTS - 1 };
    }
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return { blocked: false, error: error.message };
  }
};

/**
 * Clear failed authentication attempt (on successful login)
 */
const clearFailedAttempts = async (ipAddress) => {
  try {
    await db.query(
      'UPDATE blocked_ips SET failed_attempts = 0, unblocked_at = NOW() WHERE ip_address = ?',
      [ipAddress]
    );
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
};

/**
 * IP blocking middleware
 */
const ipBlocker = async (req, res, next) => {
  const ipAddress = getClientIp(req);
  
  // Check if IP is blocked
  const blocked = await isIpBlocked(ipAddress);
  
  if (blocked) {
    // Get block details for response
    const [blockRecord] = await db.query(
      'SELECT expires_at FROM blocked_ips WHERE ip_address = ? AND expires_at > NOW() AND unblocked_at IS NULL',
      [ipAddress]
    );
    
    const remainingMinutes = Math.ceil((new Date(blockRecord[0].expires_at) - new Date()) / 60000);
    
    return res.status(429).json({
      error: 'Too many failed attempts',
      message: `Your IP has been temporarily blocked due to too many failed authentication attempts. Please try again in ${remainingMinutes} minutes.`,
      retry_after: remainingMinutes * 60
    });
  }
  
  // Attach IP blocking functions to request for use in routes
  req.ipBlocker = {
    recordFailedAttempt: (reason) => recordFailedAttempt(ipAddress, reason),
    clearFailedAttempts: () => clearFailedAttempts(ipAddress),
    ipAddress
  };
  
  next();
};

/**
 * Admin middleware to get blocked IPs
 */
const getBlockedIps = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM blocked_ips WHERE expires_at > NOW() AND unblocked_at IS NULL ORDER BY blocked_at DESC'
    );
    res.json({ blocked_ips: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin middleware to unblock an IP
 */
const unblockIp = async (req, res) => {
  try {
    const { ip_address } = req.params;
    const userId = req.user.id;
    
    await db.query(
      'UPDATE blocked_ips SET unblocked_at = NOW(), unblocked_by = ? WHERE ip_address = ?',
      [userId, ip_address]
    );
    
    res.json({ message: 'IP unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Admin middleware to manually block an IP
 */
const blockIp = async (req, res) => {
  try {
    const { ip_address, reason, duration_minutes } = req.body;
    const userId = req.user.id;
    
    const expiresAt = new Date(Date.now() + (duration_minutes || BLOCK_DURATION_MINUTES) * 60 * 1000);
    
    await db.query(
      `INSERT INTO blocked_ips (ip_address, blocked_at, expires_at, failed_attempts, reason, unblocked_at) 
       VALUES (?, NOW(), ?, 1, ?, NULL) 
       ON DUPLICATE KEY UPDATE 
       blocked_at = NOW(), 
       expires_at = ?, 
       failed_attempts = 1, 
       reason = ?, 
       unblocked_at = NULL`,
      [ip_address, expiresAt, reason, expiresAt, reason]
    );
    
    res.json({ message: 'IP blocked successfully', expires_at: expiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cleanup expired blocks (can be run as a scheduled task)
 */
const cleanupExpiredBlocks = async () => {
  try {
    const [result] = await db.query(
      'DELETE FROM blocked_ips WHERE expires_at < NOW() AND unblocked_at IS NULL'
    );
    console.log(`Cleaned up ${result.affectedRows} expired IP blocks`);
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning up expired blocks:', error);
    return 0;
  }
};

module.exports = {
  ipBlocker,
  recordFailedAttempt,
  clearFailedAttempts,
  isIpBlocked,
  getBlockedIps,
  unblockIp,
  blockIp,
  cleanupExpiredBlocks,
  getClientIp
};
