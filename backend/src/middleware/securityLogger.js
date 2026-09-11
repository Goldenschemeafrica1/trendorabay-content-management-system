const db = require('../config/database');

// Initialize security events table on startup
const initializeSecurityTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        user_id INT,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        endpoint VARCHAR(255),
        method VARCHAR(10),
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        additional_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_user_id (user_id),
        INDEX idx_ip_address (ip_address),
        INDEX idx_severity (severity),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.query(createTableQuery);
    console.log('✅ Security events table initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize security events table:', error.message);
    // Don't throw error to allow app to start even if table creation fails
  }
};

// Initialize audit logs table on startup
const initializeAuditTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255),
        user_id INT,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        old_values JSON,
        new_values JSON,
        status ENUM('success', 'failure') DEFAULT 'success',
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_entity_type (entity_type),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await db.query(createTableQuery);
    console.log('✅ Audit logs table initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize audit logs table:', error.message);
    // Don't throw error to allow app to start even if table creation fails
  }
};

// Initialize tables on module load
initializeSecurityTable();
initializeAuditTable();

// Audit log function
const logAuditEvent = async (action, entityType, entityId, user, oldValues = null, newValues = null, status = 'success', errorMessage = null) => {
  try {
    const ipAddress = getClientIp(user?.req);
    const userAgent = user?.req?.get('user-agent') || null;

    await db.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, user_id, user_email, user_name, ip_address, user_agent, old_values, new_values, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        action,
        entityType,
        entityId,
        user?.id || null,
        user?.email || null,
        user?.name || null,
        ipAddress,
        userAgent,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        status,
        errorMessage
      ]
    );
  } catch (error) {
    console.error('Failed to log audit event:', error.message);
    // Don't throw error to avoid breaking the main operation
  }
};

// Security event types
const SecurityEventTypes = {
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_BREACH: 'RATE_LIMIT_BREACH',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  DATA_BREACH_ATTEMPT: 'DATA_BREACH_ATTEMPT',
  MALICIOUS_INPUT: 'MALICIOUS_INPUT',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  PASSWORD_RESET: 'PASSWORD_RESET'
};

// Log security event to database
const logSecurityEvent = async (eventType, details = {}) => {
  try {
    const {
      userId,
      userEmail,
      ipAddress,
      userAgent,
      endpoint,
      method,
      severity = 'medium', // low, medium, high, critical
      additionalData = {}
    } = details;

    await db.query(
      `INSERT INTO security_events 
       (event_type, user_id, user_email, ip_address, user_agent, endpoint, method, severity, additional_data, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        eventType,
        userId || null,
        userEmail || null,
        ipAddress || null,
        userAgent || null,
        endpoint || null,
        method || null,
        severity,
        JSON.stringify(additionalData)
      ]
    );

    // Check if alert should be triggered based on severity
    if (severity === 'high' || severity === 'critical') {
      await triggerSecurityAlert(eventType, details);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw error to avoid breaking application flow
  }
};

// Trigger security alert (email, webhook, etc.)
const triggerSecurityAlert = async (eventType, details) => {
  try {
    // Check if alerting is enabled
    if (process.env.SECURITY_ALERTS_ENABLED !== 'true') {
      return;
    }

    const alertData = {
      eventType,
      timestamp: new Date().toISOString(),
      severity: details.severity,
      ipAddress: details.ipAddress,
      userEmail: details.userEmail,
      endpoint: details.endpoint,
      additionalData: details.additionalData
    };

    // Send webhook alert if configured
    if (process.env.SECURITY_WEBHOOK_URL) {
      await sendWebhookAlert(alertData);
    }

    // Log critical alerts for immediate attention
    console.error('🚨 SECURITY ALERT:', JSON.stringify(alertData));
  } catch (error) {
    console.error('Failed to trigger security alert:', error);
  }
};

// Send webhook alert
const sendWebhookAlert = async (data) => {
  try {
    const response = await fetch(process.env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SECURITY_WEBHOOK_SECRET || ''}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Webhook alert failed:', error);
  }
};

// Get client IP address from request
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip;
};

// Get user agent from request
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

// Middleware to log all requests for security monitoring
const requestLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the response status
    if (res.statusCode >= 400) {
      logSecurityEvent(SecurityEventTypes.SUSPICIOUS_ACTIVITY, {
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        severity: res.statusCode >= 500 ? 'high' : 'low',
        additionalData: { statusCode: res.statusCode }
      });
    }
    originalSend.call(this, data);
  };
  
  next();
};

// Check for suspicious patterns in request
const detectSuspiciousActivity = (req) => {
  const suspiciousPatterns = [
    /\.\./,          // Path traversal
    /<script>/i,     // XSS attempt
    /union.*select/i, // SQL injection
    /eval\(/i,       // Code injection
    /exec\(/i,       // Command injection
    /javascript:/i,  // JavaScript protocol
    /onerror=/i,     // XSS event handler
    /onload=/i       // XSS event handler
  ];

  const checkString = (str) => {
    if (!str || typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Check query parameters
  for (const key in req.query) {
    if (checkString(req.query[key])) {
      return { detected: true, location: `query.${key}`, value: req.query[key] };
    }
  }

  // Check body
  if (req.body) {
    const checkObject = (obj, prefix = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && checkString(obj[key])) {
          return { detected: true, location: `${prefix}${key}`, value: obj[key] };
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const result = checkObject(obj[key], `${prefix}${key}.`);
          if (result) return result;
        }
      }
      return null;
    };
    const result = checkObject(req.body);
    if (result) return result;
  }

  return { detected: false };
};

// Middleware to detect and log suspicious activity
const suspiciousActivityDetector = async (req, res, next) => {
  const suspicious = detectSuspiciousActivity(req);
  
  if (suspicious.detected) {
    await logSecurityEvent(SecurityEventTypes.MALICIOUS_INPUT, {
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      endpoint: req.path,
      method: req.method,
      severity: 'high',
      additionalData: {
        detectedPattern: suspicious.location,
        value: suspicious.value?.substring(0, 100) // Truncate long values
      }
    });
    
    // Block suspicious requests
    return res.status(403).json({ error: 'Request blocked due to suspicious content' });
  }
  
  next();
};

module.exports = {
  SecurityEventTypes,
  logSecurityEvent,
  triggerSecurityAlert,
  getClientIp,
  getUserAgent,
  requestLogger,
  suspiciousActivityDetector,
  logAuditEvent
};
