const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add profile_image_url column to users...');
    
    const alterTable = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500)
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
