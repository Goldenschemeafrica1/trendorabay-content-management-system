const db = require('../src/config/database');
const { assignMembershipNumber } = require('../src/utils/membershipNumber');

async function assignMissingMembershipNumbers() {
  try {
    console.log('Fetching users without membership numbers...');

    const [users] = await db.query(`
      SELECT u.id, u.username, u.email, u.role, u.membership_number, c.role as cms_role
      FROM users u
      LEFT JOIN cms_users c ON u.cms_user_id = c.id
      WHERE u.membership_number IS NULL OR u.membership_number = ''
    `);

    console.log(`Found ${users.length} users without membership numbers`);

    let assignedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // Skip admin/superadmin
      if (user.role === 'admin' || user.role === 'superadmin' || user.cms_role === 'admin' || user.cms_role === 'superadmin') {
        console.log(`Skipping admin user: ${user.username} (${user.id})`);
        skippedCount++;
        continue;
      }

      try {
        const membershipNumber = await assignMembershipNumber(user.id);
        if (membershipNumber) {
          console.log(`✓ Assigned ${membershipNumber} to ${user.username} (${user.id})`);
          assignedCount++;
        } else {
          console.log(`✗ Skipped ${user.username} (${user.id}) - likely admin`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`✗ Failed to assign to ${user.username} (${user.id}):`, error.message);
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Assigned: ${assignedCount}`);
    console.log(`- Skipped (admin): ${skippedCount}`);
    console.log(`- Total processed: ${users.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignMissingMembershipNumbers();
