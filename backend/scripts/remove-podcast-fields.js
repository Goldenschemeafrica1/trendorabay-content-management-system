const db = require('../src/config/database');

async function removeFields() {
  try {
    console.log('Removing fields from podcasts table...');

    const alterQueries = [
      'ALTER TABLE podcasts DROP COLUMN video_duration',
      'ALTER TABLE podcasts DROP COLUMN episode_type',
      'ALTER TABLE podcasts DROP COLUMN plays'
    ];

    for (const query of alterQueries) {
      try {
        await db.query(query);
        console.log('Executed:', query);
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log('Column does not exist, skipping:', query);
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

removeFields();
