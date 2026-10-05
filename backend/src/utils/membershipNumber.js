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
    const [users] = await db.query(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length > 0 && (users[0].role === 'admin' || users[0].role === 'superadmin')) {
      console.log(`Skipping membership number assignment for admin user ${userId}`);
      return null;
    }

    const membershipNumber = await generateMembershipNumber();

    await db.query(
      `UPDATE users SET membership_number = ? WHERE id = ?`,
      [membershipNumber, userId]
    );

    return membershipNumber;
  } catch (error) {
    console.error('Error assigning membership number:', error);
    throw error;
  }
}

module.exports = {
  generateMembershipNumber,
  assignMembershipNumber
};
