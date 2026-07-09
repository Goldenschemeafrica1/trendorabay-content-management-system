const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Running migration to add magazine columns...');
    
    const alterTable = `
      ALTER TABLE magazines 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS digital_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS print_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS pages INT,
      ADD COLUMN IF NOT EXISTS language VARCHAR(50),
      ADD COLUMN IF NOT EXISTS publisher VARCHAR(255),
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2),
      ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS table_of_contents TEXT,
      ADD COLUMN IF NOT EXISTS contributors TEXT,
      ADD COLUMN IF NOT EXISTS preview_pages TEXT
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
