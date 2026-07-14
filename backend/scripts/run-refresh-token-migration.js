const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add refresh token columns...');
    
    // Add columns without UNIQUE constraint first
    await db.query(`
      ALTER TABLE cms_users 
      ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(500),
      ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP NULL
    `);
    
    // Add UNIQUE constraint separately if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE cms_users 
        ADD UNIQUE INDEX idx_refresh_token (refresh_token)
      `);
      console.log('Added unique index on refresh_token');
    } catch (indexError) {
      console.log('Unique index may already exist or refresh_token column has NULL values:', indexError.message);
    }
    
    console.log('Refresh token migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
