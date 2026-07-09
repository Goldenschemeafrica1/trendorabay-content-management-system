// Role hierarchy - higher number = more permissions
const roleHierarchy = {
  superadmin: 4,
  admin: 3,
  editor: 2,
  contributor: 1,
  user: 0
};

// Check if user has required role or higher
const hasRole = (userRole, requiredRole) => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Authorization middleware factory
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Authorize if user has role or higher
const authorizeOrHigher = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasRole(req.user.role, minRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: minRole,
        current: req.user.role
      });
    }
    
    next();
  };
};

// Check if user is superadmin
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  
  next();
};

// Check if user is admin or higher
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!hasRole(req.user.role, 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

// Check if user is editor or higher
const isEditor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!hasRole(req.user.role, 'editor')) {
    return res.status(403).json({ error: 'Editor access required' });
  }
  
  next();
};

// Check if user owns the resource or has admin access
const ownResourceOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admins and superadmins can access any resource
    if (hasRole(req.user.role, 'admin')) {
      return next();
    }
    
    try {
      const resourceOwnerId = await getResourceOwnerId(req);
      
      if (resourceOwnerId !== req.user.id) {
        return res.status(403).json({ error: 'You can only access your own resources' });
      }
      
      next();
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ error: 'Failed to verify resource ownership' });
    }
  };
};

module.exports = {
  authorize,
  authorizeOrHigher,
  isSuperAdmin,
  isAdmin,
  isEditor,
  ownResourceOrAdmin,
  hasRole
};
