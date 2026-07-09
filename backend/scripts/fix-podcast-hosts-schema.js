const db = require('../src/config/database');

async function fixPodcastHostsSchema() {
  try {
    console.log('Checking podcast_hosts table structure...');
    
    // Check if columns exist
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'podcast_hosts' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Add missing columns if they don't exist
    if (!columnNames.includes('photo_url')) {
      console.log('Adding photo_url column...');
      await db.query('ALTER TABLE podcast_hosts ADD COLUMN photo_url VARCHAR(500) AFTER bio');
    }
    
    if (!columnNames.includes('twitter')) {
      console.log('Adding twitter column...');
      await db.query('ALTER TABLE podcast_hosts ADD COLUMN twitter VARCHAR(255) AFTER email');
    }
    
    if (!columnNames.includes('instagram')) {
      console.log('Adding instagram column...');
      await db.query('ALTER TABLE podcast_hosts ADD COLUMN instagram VARCHAR(255) AFTER twitter');
    }
    
    if (!columnNames.includes('linkedin')) {
      console.log('Adding linkedin column...');
      await db.query('ALTER TABLE podcast_hosts ADD COLUMN linkedin VARCHAR(255) AFTER instagram');
    }
    
    console.log('Podcast hosts schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

fixPodcastHostsSchema();
