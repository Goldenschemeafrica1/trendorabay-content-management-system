const db = require('../src/config/database');

async function addDisplaySettings() {
  try {
    console.log('Adding display settings columns to stories table...');

    // Add display_section
    try {
      await db.query("ALTER TABLE stories ADD COLUMN display_section ENUM('default', 'latest_stories', 'must_read', 'innovation') DEFAULT 'default' AFTER views");
      console.log('Added display_section column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('display_section column already exists, skipping');
      } else {
        console.error('Error adding display_section column:', error.message);
      }
    }

    // Add display_order
    try {
      await db.query('ALTER TABLE stories ADD COLUMN display_order INT DEFAULT 0 AFTER display_section');
      console.log('Added display_order column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('display_order column already exists, skipping');
      } else {
        console.error('Error adding display_order column:', error.message);
      }
    }

    // Add priority
    try {
      await db.query('ALTER TABLE stories ADD COLUMN priority INT DEFAULT 0 AFTER display_order');
      console.log('Added priority column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('priority column already exists, skipping');
      } else {
        console.error('Error adding priority column:', error.message);
      }
    }

    // Add display_start_date
    try {
      await db.query('ALTER TABLE stories ADD COLUMN display_start_date DATE NULL AFTER priority');
      console.log('Added display_start_date column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('display_start_date column already exists, skipping');
      } else {
        console.error('Error adding display_start_date column:', error.message);
      }
    }

    // Add display_end_date
    try {
      await db.query('ALTER TABLE stories ADD COLUMN display_end_date DATE NULL AFTER display_start_date');
      console.log('Added display_end_date column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('display_end_date column already exists, skipping');
      } else {
        console.error('Error adding display_end_date column:', error.message);
      }
    }

    // Add is_pinned
    try {
      await db.query('ALTER TABLE stories ADD COLUMN is_pinned TINYINT(1) DEFAULT 0 AFTER display_end_date');
      console.log('Added is_pinned column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('is_pinned column already exists, skipping');
      } else {
        console.error('Error adding is_pinned column:', error.message);
      }
    }

    // Add indexes
    try {
      await db.query('CREATE INDEX idx_stories_display_section_order ON stories(display_section, display_order)');
      console.log('Added idx_stories_display_section_order index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('idx_stories_display_section_order index already exists, skipping');
      } else {
        console.error('Error adding idx_stories_display_section_order index:', error.message);
      }
    }

    try {
      await db.query('CREATE INDEX idx_stories_pinned ON stories(is_pinned, display_section)');
      console.log('Added idx_stories_pinned index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('idx_stories_pinned index already exists, skipping');
      } else {
        console.error('Error adding idx_stories_pinned index:', error.message);
      }
    }

    try {
      await db.query('CREATE INDEX idx_stories_display_dates ON stories(display_start_date, display_end_date)');
      console.log('Added idx_stories_display_dates index');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('idx_stories_display_dates index already exists, skipping');
      } else {
        console.error('Error adding idx_stories_display_dates index:', error.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addDisplaySettings();
