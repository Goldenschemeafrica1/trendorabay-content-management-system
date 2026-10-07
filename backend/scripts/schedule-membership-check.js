const db = require('../src/config/database');
const { assignMembershipNumber } = require('../src/utils/membershipNumber');

/**
 * This script should be run periodically (e.g., via cron job)
 * to ensure all users have membership numbers
 */
async function checkAndAssignMembershipNumbers() {
  try {
    console.log('Checking for users without membership numbers...');

    // Get all users without membership numbers
    const [users] = await db.query(
      `SELECT id, username, email, role, membership_number
       FROM users
       WHERE membership_number IS NULL OR membership_number = ''
       ORDER BY created_at DESC`
    );

    if (users.length === 0) {
      console.log('✅ All users have membership numbers');
      process.exit(0);
    }

    console.log(`Found ${users.length} users without membership numbers`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Skip admin/superadmin users
        if (user.role === 'admin' || user.role === 'superadmin') {
          console.log(`⏭️  Skipping admin user: ${user.username} (${user.email})`);
          skippedCount++;
          continue;
        }

        const membershipNumber = await assignMembershipNumber(user.id);
        console.log(`✅ Assigned ${membershipNumber} to ${user.username} (${user.email})`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to assign membership number to ${user.username} (${user.email}):`, error.message);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`✅ Fixed: ${fixedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users (admins)`);
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('Error checking membership numbers:', error);
    process.exit(1);
  }
}

checkAndAssignMembershipNumbers();
