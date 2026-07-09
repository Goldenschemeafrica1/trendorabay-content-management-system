const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Adding editor role to cms_users table...');
    
    // MySQL doesn't support ALTER COLUMN for ENUM directly, need to recreate the column
    const alterTable = `
      ALTER TABLE cms_users 
      MODIFY COLUMN role ENUM('admin', 'user', 'contributor', 'superadmin', 'editor') DEFAULT 'user'
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
