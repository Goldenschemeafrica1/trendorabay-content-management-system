const crypto = require('crypto');

/**
 * API Request Signature Middleware
 * Verifies HMAC-SHA256 signatures for critical operations
 */

const API_SIGNATURE_SECRET = process.env.API_SIGNATURE_SECRET || 'default-secret-change-in-production';

/**
 * Generate HMAC-SHA256 signature for a request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} body - Request body
 * @param {string} timestamp - Request timestamp
 * @returns {string} - Hex signature
 */
const generateSignature = (method, path, body, timestamp) => {
  const payload = `${method}:${path}:${JSON.stringify(body)}:${timestamp}`;
  return crypto
    .createHmac('sha256', API_SIGNATURE_SECRET)
    .update(payload)
    .digest('hex');
};

/**
 * Verify request signature middleware
 * Checks for X-Signature and X-Timestamp headers
 */
const verifyRequestSignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];

  // Skip signature verification if not configured (development mode)
  if (!process.env.API_SIGNATURE_SECRET || process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if signature is present
  if (!signature) {
    return res.status(401).json({ 
      error: 'Missing signature header',
      message: 'X-Signature header is required for this operation'
    });
  }

  // Check if timestamp is present
  if (!timestamp) {
    return res.status(401).json({ 
      error: 'Missing timestamp header',
      message: 'X-Timestamp header is required for this operation'
    });
  }

  // Check timestamp freshness (reject requests older than 5 minutes)
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now();
  const timeDiff = (currentTime - requestTime) / 1000; // Convert to seconds

  if (timeDiff > 300) {
    return res.status(401).json({ 
      error: 'Request expired',
      message: 'Request timestamp is too old'
    });
  }

  if (timeDiff < -60) {
    return res.status(401).json({ 
      error: 'Invalid timestamp',
      message: 'Request timestamp is in the future'
    });
  }

  // Generate expected signature
  const expectedSignature = generateSignature(
    req.method,
    req.path,
    req.body,
    timestamp
  );

  // Verify signature
  if (signature !== expectedSignature) {
    // Log signature mismatch for security monitoring
    console.error('Signature verification failed:', {
      path: req.path,
      method: req.method,
      expected: expectedSignature,
      received: signature,
      ip: req.ip
    });

    return res.status(401).json({ 
      error: 'Invalid signature',
      message: 'Request signature verification failed'
    });
  }

  // Signature is valid
  next();
};

/**
 * Generate signature for frontend use
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {object} body - Request body
 * @returns {object} - Object with signature and timestamp
 */
const createRequestSignature = (method, path, body = {}) => {
  const timestamp = Date.now().toString();
  const signature = generateSignature(method, path, body, timestamp);
  
  return {
    signature,
    timestamp
  };
};

module.exports = {
  verifyRequestSignature,
  createRequestSignature,
  generateSignature
};
