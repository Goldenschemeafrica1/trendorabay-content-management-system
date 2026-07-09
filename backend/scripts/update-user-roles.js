const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Updating users table role enum to include contributor and superadmin...');
    
    // MySQL doesn't support ALTER COLUMN for ENUM directly, need to recreate the column
    const alterTable = `
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('admin', 'user', 'contributor', 'superadmin') DEFAULT 'user'
    `;
    
    await db.query(alterTable);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
