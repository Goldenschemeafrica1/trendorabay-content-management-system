const db = require('../src/config/database');

async function fixStoriesSchema() {
  try {
    console.log('Fixing stories table schema...');

    // Add slug column (without UNIQUE constraint first)
    try {
      await db.query('ALTER TABLE stories ADD COLUMN slug VARCHAR(255) AFTER title');
      console.log('Added slug column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('slug column already exists, skipping');
      } else {
        console.error('Error adding slug column:', error.message);
      }
    }

    // Update existing stories to have slugs
    const [stories] = await db.query('SELECT id, title FROM stories WHERE slug IS NULL OR slug = ""');
    for (const story of stories) {
      const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + story.id;
      await db.query('UPDATE stories SET slug = ? WHERE id = ?', [slug, story.id]);
      console.log(`Updated slug for story ${story.id}: ${slug}`);
    }

    // Now add UNIQUE constraint
    try {
      await db.query('ALTER TABLE stories ADD UNIQUE INDEX idx_slug (slug)');
      console.log('Added UNIQUE constraint on slug');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('UNIQUE constraint on slug already exists, skipping');
      } else {
        console.error('Error adding UNIQUE constraint:', error.message);
      }
    }

    // Add excerpt column
    try {
      await db.query('ALTER TABLE stories ADD COLUMN excerpt TEXT AFTER content');
      console.log('Added excerpt column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('excerpt column already exists, skipping');
      } else {
        console.error('Error adding excerpt column:', error.message);
      }
    }

    // Add featured column
    try {
      await db.query('ALTER TABLE stories ADD COLUMN featured TINYINT(1) DEFAULT 0 AFTER status');
      console.log('Added featured column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('featured column already exists, skipping');
      } else {
        console.error('Error adding featured column:', error.message);
      }
    }

    // Add published_at column
    try {
      await db.query('ALTER TABLE stories ADD COLUMN published_at TIMESTAMP NULL AFTER featured');
      console.log('Added published_at column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('published_at column already exists, skipping');
      } else {
        console.error('Error adding published_at column:', error.message);
      }
    }

    // Add read_time column
    try {
      await db.query('ALTER TABLE stories ADD COLUMN read_time VARCHAR(50) DEFAULT "5 min read" AFTER published_at');
      console.log('Added read_time column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('read_time column already exists, skipping');
      } else {
        console.error('Error adding read_time column:', error.message);
      }
    }

    // Add views column
    try {
      await db.query('ALTER TABLE stories ADD COLUMN views INT(11) DEFAULT 0 AFTER read_time');
      console.log('Added views column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('views column already exists, skipping');
      } else {
        console.error('Error adding views column:', error.message);
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixStoriesSchema();
