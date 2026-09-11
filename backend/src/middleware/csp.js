const db = require('../config/database');

/**
 * Content Security Policy (CSP) Middleware
 * Implements CSP headers and violation reporting
 */

/**
 * Initialize csp_violations table on startup
 */
const initializeCspTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS csp_violations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_uri VARCHAR(500) NOT NULL,
        referrer VARCHAR(500),
        blocked_uri VARCHAR(500) NOT NULL,
        violated_directive VARCHAR(100) NOT NULL,
        effective_directive VARCHAR(100),
        original_policy TEXT,
        disposition VARCHAR(20),
        script_sample TEXT,
        status_code INT,
        user_agent VARCHAR(500),
        ip_address VARCHAR(45),
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        severity VARCHAR(20) DEFAULT 'low',
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP NULL,
        resolved_by INT NULL,
        notes TEXT,
        INDEX idx_reported_at (reported_at),
        INDEX idx_severity (severity),
        INDEX idx_resolved (resolved),
        INDEX idx_violated_directive (violated_directive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.query(createTableQuery);
    console.log('✅ CSP violations table initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize csp_violations table:', error.message);
  }
};

// Initialize table on module load
initializeCspTable();

/**
 * Generate CSP policy
 */
const generateCspPolicy = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // More permissive CSP for development
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
      "connect-src 'self' https://trendorabay-content-management-system.onrender.com http://localhost:5002 ws://localhost:5002 wss://trendorabay-content-management-system.onrender.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "require-trusted-types-for 'script'",
      "report-uri /api/security/csp-report"
    ].join('; ');
  } else {
    // Strict CSP for production with SRI support
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://cdn.jsdelivr.net",
      "connect-src 'self' https://trendorabay-content-management-system.onrender.com wss://trendorabay-content-management-system.onrender.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "require-trusted-types-for 'script'",
      "upgrade-insecure-requests",
      "report-uri /api/security/csp-report"
    ].join('; ');
  }
};

/**
 * CSP middleware to add headers
 */
const cspMiddleware = (req, res, next) => {
  const cspPolicy = generateCspPolicy();
  
  res.setHeader('Content-Security-Policy', cspPolicy);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

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
 * Determine severity of CSP violation
 */
const determineSeverity = (violation) => {
  const highRiskDirectives = ['script-src', 'object-src', 'frame-src', 'base-uri'];
  const mediumRiskDirectives = ['style-src', 'img-src', 'connect-src', 'font-src'];
  
  if (highRiskDirectives.includes(violation.violatedDirective)) {
    return 'high';
  } else if (mediumRiskDirectives.includes(violation.violatedDirective)) {
    return 'medium';
  }
  return 'low';
};

/**
 * Record CSP violation
 */
const recordCspViolation = async (violation, req) => {
  try {
    const severity = determineSeverity(violation);
    
    await db.query(
      `INSERT INTO csp_violations (
        document_uri, referrer, blocked_uri, violated_directive, 
        effective_directive, original_policy, disposition, 
        script_sample, user_agent, ip_address, severity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        violation.documentURI || null,
        violation.referrer || null,
        violation.blockedURI || null,
        violation.violatedDirective || null,
        violation.effectiveDirective || null,
        violation.originalPolicy || null,
        violation.disposition || null,
        violation.scriptSample || null,
        req.headers['user-agent'] || null,
        getClientIp(req),
        severity
      ]
    );
    
    console.log('CSP violation recorded:', violation.violatedDirective, violation.blockedURI);
  } catch (error) {
    console.error('Error recording CSP violation:', error);
  }
};

/**
 * CSP report collection endpoint handler
 */
const handleCspReport = async (req, res) => {
  try {
    // CSP reports are sent as JSON in the request body
    const report = req.body;
    
    if (!report || !report['csp-report']) {
      return res.status(400).json({ error: 'Invalid CSP report format' });
    }
    
    const violation = report['csp-report'];
    
    // Record the violation
    await recordCspViolation(violation, req);
    
    // Return 204 No Content as per CSP spec
    res.status(204).send();
  } catch (error) {
    console.error('Error handling CSP report:', error);
    res.status(500).json({ error: 'Failed to process CSP report' });
  }
};

/**
 * Get CSP violations (admin only)
 */
const getCspViolations = async (req, res) => {
  try {
    const { 
      severity, 
      resolved, 
      limit = 100, 
      offset = 0,
      start_date,
      end_date
    } = req.query;
    
    let query = 'SELECT * FROM csp_violations WHERE 1=1';
    const params = [];
    
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    
    if (resolved !== undefined) {
      query += ' AND resolved = ?';
      params.push(resolved === 'true');
    }
    
    if (start_date) {
      query += ' AND reported_at >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND reported_at <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY reported_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(query, params);
    
    res.json({ violations: rows });
  } catch (error) {
    console.error('Error fetching CSP violations:', error);
    res.status(500).json({ error: 'Failed to fetch CSP violations' });
  }
};

/**
 * Get CSP statistics
 */
const getCspStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Total violations
    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM csp_violations WHERE reported_at >= ?',
      [startDate]
    );
    
    // Violations by severity
    const [severityResult] = await db.query(
      'SELECT severity, COUNT(*) as count FROM csp_violations WHERE reported_at >= ? GROUP BY severity',
      [startDate]
    );
    
    // Violations by directive
    const [directiveResult] = await db.query(
      'SELECT violated_directive, COUNT(*) as count FROM csp_violations WHERE reported_at >= ? GROUP BY violated_directive ORDER BY count DESC LIMIT 10',
      [startDate]
    );
    
    // Top blocked URIs
    const [uriResult] = await db.query(
      'SELECT blocked_uri, COUNT(*) as count FROM csp_violations WHERE reported_at >= ? GROUP BY blocked_uri ORDER BY count DESC LIMIT 10',
      [startDate]
    );
    
    // Resolved vs unresolved
    const [resolvedResult] = await db.query(
      'SELECT resolved, COUNT(*) as count FROM csp_violations WHERE reported_at >= ? GROUP BY resolved',
      [startDate]
    );
    
    const severityStats = {};
    severityResult.forEach(row => {
      severityStats[row.severity] = row.count;
    });
    
    const resolvedStats = {};
    resolvedResult.forEach(row => {
      resolvedStats[row.resolved ? 'resolved' : 'unresolved'] = row.count;
    });
    
    res.json({
      total_violations: totalResult[0].total,
      by_severity: severityStats,
      by_directive: directiveResult,
      top_blocked_uris: uriResult,
      resolved_status: resolvedStats,
      period_days: days
    });
  } catch (error) {
    console.error('Error fetching CSP stats:', error);
    res.status(500).json({ error: 'Failed to fetch CSP statistics' });
  }
};

/**
 * Resolve CSP violation
 */
const resolveCspViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    
    await db.query(
      'UPDATE csp_violations SET resolved = TRUE, resolved_at = NOW(), resolved_by = ?, notes = ? WHERE id = ?',
      [userId, notes || null, id]
    );
    
    res.json({ message: 'CSP violation marked as resolved' });
  } catch (error) {
    console.error('Error resolving CSP violation:', error);
    res.status(500).json({ error: 'Failed to resolve CSP violation' });
  }
};

/**
 * Delete old CSP violations
 */
const cleanupOldViolations = async (daysToKeep = 90) => {
  try {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const [result] = await db.query(
      'DELETE FROM csp_violations WHERE reported_at < ? AND resolved = TRUE',
      [cutoffDate]
    );
    console.log(`Cleaned up ${result.affectedRows} old resolved CSP violations`);
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning up old CSP violations:', error);
    return 0;
  }
};

module.exports = {
  cspMiddleware,
  handleCspReport,
  getCspViolations,
  getCspStats,
  resolveCspViolation,
  cleanupOldViolations,
  generateCspPolicy
};
