const db = require('../src/config/database');

async function fixPodcastGuestsSchema() {
  try {
    console.log('Fixing podcast_guests table structure...');
    
    // Check current columns
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'podcast_guests' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Rename image_url to avatar_url if it exists
    if (columnNames.includes('image_url') && !columnNames.includes('avatar_url')) {
      console.log('Renaming image_url to avatar_url...');
      await db.query('ALTER TABLE podcast_guests CHANGE COLUMN image_url avatar_url VARCHAR(500)');
    }
    
    // Add missing columns
    if (!columnNames.includes('title')) {
      console.log('Adding title column...');
      await db.query('ALTER TABLE podcast_guests ADD COLUMN title VARCHAR(255) AFTER name');
    }
    
    if (!columnNames.includes('email')) {
      console.log('Adding email column...');
      await db.query('ALTER TABLE podcast_guests ADD COLUMN email VARCHAR(255) AFTER avatar_url');
    }
    
    if (!columnNames.includes('episode')) {
      console.log('Adding episode column...');
      await db.query('ALTER TABLE podcast_guests ADD COLUMN episode VARCHAR(255) AFTER email');
    }
    
    if (!columnNames.includes('status')) {
      console.log('Adding status column...');
      await db.query("ALTER TABLE podcast_guests ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER episode");
    }
    
    // Drop episode_count if it exists (replaced by episode)
    if (columnNames.includes('episode_count')) {
      console.log('Dropping episode_count column...');
      await db.query('ALTER TABLE podcast_guests DROP COLUMN episode_count');
    }
    
    console.log('Podcast guests schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

fixPodcastGuestsSchema();
