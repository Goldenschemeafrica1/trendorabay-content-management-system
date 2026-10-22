/**
 * Generate a unique membership number in format TRB-YY-XXXXXX
 * Where:
 * - TRB = Trendorabay
 * - YY = last 2 digits of current year
 * - XXXXXX = 6-digit zero-padded sequence number
 */

const db = require('../config/database');

async function generateMembershipNumber() {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits

  try {
    // Get the highest sequence number for the current year
    const [rows] = await db.query(
      `SELECT membership_number
       FROM users
       WHERE membership_number LIKE ?
       ORDER BY membership_number DESC
       LIMIT 1`,
      [`TRB-${yearSuffix}-%`]
    );

    let nextSequence = 1;

    if (rows.length > 0) {
      // Extract the sequence number from the last membership number
      const lastMembershipNumber = rows[0].membership_number;
      const lastSequence = parseInt(lastMembershipNumber.split('-')[2]);
      nextSequence = lastSequence + 1;
    }

    // Format as 6-digit zero-padded number
    const sequenceStr = nextSequence.toString().padStart(6, '0');

    return `TRB-${yearSuffix}-${sequenceStr}`;
  } catch (error) {
    console.error('Error generating membership number:', error);
    throw error;
  }
}

async function assignMembershipNumber(userId) {
  try {
    // Check if user is admin - don't assign membership number to admins
    // Check both cms_users and users tables for role
    const [cmsUsers] = await db.query(
      `SELECT role FROM cms_users WHERE id = ?`,
      [userId]
    );

    const [users] = await db.query(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    const cmsRole = cmsUsers.length > 0 ? cmsUsers[0].role : null;
    const usersRole = users.length > 0 ? users[0].role : null;

    // Skip assignment if user is admin or superadmin in either table
    if ((cmsRole === 'admin' || cmsRole === 'superadmin') || (usersRole === 'admin' || usersRole === 'superadmin')) {
      console.log(`Skipping membership number assignment for admin user ${userId} (cms_role: ${cmsRole}, users_role: ${usersRole})`);
      return null;
    }

    const membershipNumber = await generateMembershipNumber();

    await db.query(
      `UPDATE users SET membership_number = ? WHERE id = ?`,
      [membershipNumber, userId]
    );

    console.log(`Assigned membership number ${membershipNumber} to user ${userId}`);
    return membershipNumber;
  } catch (error) {
    console.error('Error assigning membership number:', error);
    throw error;
  }
}

// Ensure a user has a membership number (assign if missing)
async function ensureMembershipNumber(userId) {
  try {
    // Check both tables for user role and membership number
    const [cmsUsers] = await db.query(
      `SELECT id, role FROM cms_users WHERE id = ?`,
      [userId]
    );

    const [users] = await db.query(
      `SELECT id, role, membership_number FROM users WHERE id = ?`,
      [userId]
    );

    if (cmsUsers.length === 0 && users.length === 0) {
      console.log(`User ${userId} not found in either table`);
      return null;
    }

    const cmsRole = cmsUsers.length > 0 ? cmsUsers[0].role : null;
    const usersRole = users.length > 0 ? users[0].role : null;
    const membershipNumber = users.length > 0 ? users[0].membership_number : null;

    // Skip admin/superadmin (check both tables)
    if ((cmsRole === 'admin' || cmsRole === 'superadmin') || (usersRole === 'admin' || usersRole === 'superadmin')) {
      console.log(`Skipping membership number for admin user ${userId}`);
      return null;
    }

    // If already has membership number, return it
    if (membershipNumber) {
      return membershipNumber;
    }

    // Assign new membership number
    return await assignMembershipNumber(userId);
  } catch (error) {
    console.error('Error ensuring membership number:', error);
    throw error;
  }
}

module.exports = {
  generateMembershipNumber,
  assignMembershipNumber,
  ensureMembershipNumber
};
