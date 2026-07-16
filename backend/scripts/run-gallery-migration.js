const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runGalleryMigration() {
  try {
    console.log('Running migration to create gallery table...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/create_gallery_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await db.query(migrationSQL);
    console.log('Gallery table migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runGalleryMigration();
