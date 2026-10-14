const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to drop phone_number column from users table...');
    await db.query('ALTER TABLE users DROP COLUMN IF EXISTS phone_number');
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
