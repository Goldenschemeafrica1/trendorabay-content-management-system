const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add followers column to contributors...');
    
    const alterTable = `
      ALTER TABLE contributors 
      ADD COLUMN IF NOT EXISTS followers INT DEFAULT 0
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
