const db = require('../src/config/database');

async function dropTable() {
  try {
    console.log('Disabling foreign key checks...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Dropping cms_users table...');
    await db.query('DROP TABLE IF EXISTS cms_users');
    
    console.log('Re-enabling foreign key checks...');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('cms_users table dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to drop table:', error.message);
    process.exit(1);
  }
}

dropTable();
