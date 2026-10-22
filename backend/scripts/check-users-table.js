const db = require('../src/config/database');

async function checkTable() {
  try {
    console.log('Checking users table structure...');
    const [rows] = await db.query('DESCRIBE users');
    console.log('Users table columns:');
    rows.forEach(row => {
      console.log(`- ${row.Field}: ${row.Type}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTable();
