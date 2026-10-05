const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add phone_number column to users table...');

    const alterTable = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(100)
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
