const db = require('../src/config/database');

async function checkUserNames() {
  try {
    console.log('Checking user first and last names...');
    
    // Check users table structure
    const [columns] = await db.query('DESCRIBE users');
    console.log('\nUsers table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Check actual data
    const [rows] = await db.query('SELECT id, username, first_name, last_name, email FROM users LIMIT 5');
    
    console.log('\nUser names:');
    rows.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   First Name: ${user.first_name || 'NULL'}`);
      console.log(`   Last Name: ${user.last_name || 'NULL'}`);
      console.log(`   Email: ${user.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user names:', error.message);
    process.exit(1);
  }
}

checkUserNames();
