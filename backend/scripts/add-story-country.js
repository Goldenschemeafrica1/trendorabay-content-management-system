const db = require('../src/config/database');

async function addStoryCountry() {
  try {
    console.log('Adding country column to stories table...');

    await db.query(`
      ALTER TABLE stories
      ADD COLUMN country VARCHAR(100) AFTER category_id
    `);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, skipping migration.');
      process.exit(0);
    }
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addStoryCountry();
