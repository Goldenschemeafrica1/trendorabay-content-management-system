const rateLimit = require('express-rate-limit');

/**
 * User-based Rate Limiting Middleware
 * Implements rate limiting per user ID with role-based limits
 */

// Rate limit configuration by role
const roleLimits = {
  superadmin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // 2000 requests per window
    message: 'Rate limit exceeded for superadmin'
  },
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1500, // 1500 requests per window
    message: 'Rate limit exceeded for admin'
  },
  editor: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window
    message: 'Rate limit exceeded for editor'
  },
  contributor: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    message: 'Rate limit exceeded for contributor'
  },
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per window
    message: 'Rate limit exceeded for user'
  }
};

/**
 * Generate a unique key for rate limiting
 * Uses user ID for authenticated users, IP for unauthenticated
 */
const getKeyGenerator = (req) => {
  // If user is authenticated, use user ID
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  
  // Fallback to IP-based for unauthenticated users
  // Use the built-in ipKeyGenerator helper for proper IPv6 handling
  return rateLimit.ipKeyGenerator(req);
};

/**
 * Create user-based rate limiter
 * @param {Object} options - Rate limit options
 * @returns {Function} - Express middleware
 */
const createUserRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 1000,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: getKeyGenerator,
    handler: (req, res) => {
      // Log rate limit violations
      console.warn('Rate limit exceeded:', {
        key: getKeyGenerator(req),
        userId: req.user?.id,
        userRole: req.user?.role,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

/**
 * Create role-based rate limiter
 * Automatically adjusts limits based on user role
 */
const createRoleBasedRateLimiter = () => {
  return (req, res, next) => {
    // If user is not authenticated, use default limits
    if (!req.user || !req.user.role) {
      const defaultLimiter = createUserRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests, please try again later.'
      });
      return defaultLimiter(req, res, next);
    }

    // Get role-specific limits
    const roleConfig = roleLimits[req.user.role] || roleLimits.user;
    
    const roleLimiter = createUserRateLimiter(roleConfig);
    roleLimiter(req, res, next);
  };
};

/**
 * Strict rate limiter for sensitive operations
 * Lower limits for authentication and critical operations
 */
const createStrictRateLimiter = () => {
  return createUserRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    message: 'Too many authentication attempts, please try again later.'
  });
};

/**
 * API rate limiter for general API endpoints
 */
const createApiRateLimiter = () => {
  return createUserRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    message: 'API rate limit exceeded, please try again later.'
  });
};

/**
 * Upload rate limiter for file uploads
 */
const createUploadRateLimiter = () => {
  return createUserRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: 'Upload rate limit exceeded, please try again later.'
  });
};

/**
 * Get current rate limit status for a user
 */
const getRateLimitStatus = (req) => {
  const key = getKeyGenerator(req);
  // This would need to be implemented with a proper store
  // For now, return basic info
  return {
    key,
    userId: req.user?.id,
    userRole: req.user?.role,
    ip: req.ip
  };
};

module.exports = {
  createUserRateLimiter,
  createRoleBasedRateLimiter,
  createStrictRateLimiter,
  createApiRateLimiter,
  createUploadRateLimiter,
  getRateLimitStatus,
  roleLimits
};
