const db = require('../src/config/database');

async function addMissingFields() {
  try {
    console.log('Adding missing fields to podcasts table...');

    // Add missing columns
    const alterQueries = [
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS video_file_url VARCHAR(500)',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS video_duration VARCHAR(100)',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS episode_type VARCHAR(50) DEFAULT "audio"',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS guest VARCHAR(255)',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS duration VARCHAR(100)',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS plays INT DEFAULT 0',
      'ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS status ENUM("draft", "published") DEFAULT "draft"'
    ];

    for (const query of alterQueries) {
      try {
        await db.query(query);
        console.log('Executed:', query);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('Column already exists, skipping:', query);
        } else {
          console.error('Error executing query:', query, error.message);
        }
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addMissingFields();
