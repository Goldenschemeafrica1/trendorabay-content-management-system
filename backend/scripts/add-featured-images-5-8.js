const db = require('../src/config/database');

async function addFeaturedImages5To8() {
  try {
    console.log('Adding featured_image_url_5 to featured_image_url_8 columns to stories table...');

    await db.query(`
      ALTER TABLE stories
      ADD COLUMN featured_image_url_5 VARCHAR(500) AFTER featured_image_url_4
    `);
    console.log('Added featured_image_url_5');

    await db.query(`
      ALTER TABLE stories
      ADD COLUMN featured_image_url_6 VARCHAR(500) AFTER featured_image_url_5
    `);
    console.log('Added featured_image_url_6');

    await db.query(`
      ALTER TABLE stories
      ADD COLUMN featured_image_url_7 VARCHAR(500) AFTER featured_image_url_6
    `);
    console.log('Added featured_image_url_7');

    await db.query(`
      ALTER TABLE stories
      ADD COLUMN featured_image_url_8 VARCHAR(500) AFTER featured_image_url_7
    `);
    console.log('Added featured_image_url_8');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist, skipping migration.');
      process.exit(0);
    }
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addFeaturedImages5To8();
