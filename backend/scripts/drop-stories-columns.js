const db = require('../src/config/database');

async function dropStoriesColumns() {
  try {
    console.log('Dropping slug and excerpt columns from stories table...');

    // Drop slug column
    try {
      await db.query('ALTER TABLE stories DROP COLUMN slug');
      console.log('Dropped slug column');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('slug column does not exist, skipping');
      } else {
        console.error('Error dropping slug column:', error.message);
      }
    }

    // Drop excerpt column
    try {
      await db.query('ALTER TABLE stories DROP COLUMN excerpt');
      console.log('Dropped excerpt column');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('excerpt column does not exist, skipping');
      } else {
        console.error('Error dropping excerpt column:', error.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

dropStoriesColumns();
