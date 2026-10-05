const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add membership_number column to users table...');

    // Check if column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'membership_number'
    `);

    if (columns.length > 0) {
      console.log('Column membership_number already exists. Skipping...');
      process.exit(0);
    }

    // Add column without UNIQUE constraint first
    await db.query(`
      ALTER TABLE users
      ADD COLUMN membership_number VARCHAR(20)
    `);

    // Add unique index separately
    await db.query(`
      ALTER TABLE users
      ADD UNIQUE INDEX idx_membership_number (membership_number)
    `);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
