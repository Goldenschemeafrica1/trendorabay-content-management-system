const { ensureMembershipNumber } = require('../utils/membershipNumber');

// Middleware to ensure a user has a membership number
// This can be used in routes that fetch user data
async function ensureUserMembership(req, res, next) {
  try {
    // If we have a user ID in the request (from auth middleware)
    if (req.user && req.user.id) {
      // Check if the user has a membership number
      // This runs asynchronously and doesn't block the request
      ensureMembershipNumber(req.user.id).catch(err => {
        console.error('Error ensuring membership number:', err);
      });
    }
    next();
  } catch (error) {
    // Don't block the request if this fails
    console.error('Membership middleware error:', error);
    next();
  }
}

module.exports = {
  ensureUserMembership
};
