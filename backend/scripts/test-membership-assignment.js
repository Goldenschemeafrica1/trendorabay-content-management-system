const db = require('../src/config/database');
const { assignMembershipNumber, ensureMembershipNumber } = require('../src/utils/membershipNumber');

async function testMembershipAssignment() {
  try {
    console.log('Fetching users without membership numbers...');

    const [users] = await db.query(`
      SELECT u.id, u.username, u.email, u.role, u.membership_number, c.role as cms_role
      FROM users u
      LEFT JOIN cms_users c ON u.cms_user_id = c.id
      WHERE u.membership_number IS NULL OR u.membership_number = ''
      LIMIT 5
    `);

    console.log(`Found ${users.length} users without membership numbers:`);
    console.log(JSON.stringify(users, null, 2));

    if (users.length === 0) {
      console.log('No users without membership numbers found.');
      return;
    }

    // Try to assign membership number to the first non-admin user
    const testUser = users.find(u => u.role !== 'admin' && u.role !== 'superadmin' && u.cms_role !== 'admin' && u.cms_role !== 'superadmin');

    if (!testUser) {
      console.log('No non-admin users found to test with.');
      return;
    }

    console.log(`\nAttempting to assign membership number to user ${testUser.id} (${testUser.username})...`);

    const membershipNumber = await assignMembershipNumber(testUser.id);
    console.log(`Membership number assigned: ${membershipNumber}`);

    // Verify the assignment
    const [updatedUser] = await db.query(
      'SELECT membership_number FROM users WHERE id = ?',
      [testUser.id]
    );
    console.log(`Verified membership number: ${updatedUser[0].membership_number}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testMembershipAssignment();
