const db = require('../src/config/database');

async function addImageColumns() {
  try {
    console.log('Adding additional image columns to stories table...');

    // Add featured_image_url_2
    try {
      await db.query('ALTER TABLE stories ADD COLUMN featured_image_url_2 VARCHAR(500) AFTER featured_image_url');
      console.log('Added featured_image_url_2 column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('featured_image_url_2 column already exists, skipping');
      } else {
        console.error('Error adding featured_image_url_2 column:', error.message);
      }
    }

    // Add featured_image_url_3
    try {
      await db.query('ALTER TABLE stories ADD COLUMN featured_image_url_3 VARCHAR(500) AFTER featured_image_url_2');
      console.log('Added featured_image_url_3 column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('featured_image_url_3 column already exists, skipping');
      } else {
        console.error('Error adding featured_image_url_3 column:', error.message);
      }
    }

    // Add featured_image_url_4
    try {
      await db.query('ALTER TABLE stories ADD COLUMN featured_image_url_4 VARCHAR(500) AFTER featured_image_url_3');
      console.log('Added featured_image_url_4 column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('featured_image_url_4 column already exists, skipping');
      } else {
        console.error('Error adding featured_image_url_4 column:', error.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addImageColumns();
