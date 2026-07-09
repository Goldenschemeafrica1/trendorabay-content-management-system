const db = require('../src/config/database');

async function addVideoFieldsToPodcasts() {
  try {
    console.log('Adding video-related fields to podcasts table...');
    
    // Check current columns
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'podcasts' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Add video-related columns if they don't exist
    if (!columnNames.includes('video_file_url')) {
      console.log('Adding video_file_url column...');
      await db.query('ALTER TABLE podcasts ADD COLUMN video_file_url VARCHAR(500) AFTER audio_file_url');
    }
    
    if (!columnNames.includes('video_duration')) {
      console.log('Adding video_duration column...');
      await db.query('ALTER TABLE podcasts ADD COLUMN video_duration VARCHAR(50) AFTER video_file_url');
    }
    
    if (!columnNames.includes('video_thumbnail_url')) {
      console.log('Adding video_thumbnail_url column...');
      await db.query('ALTER TABLE podcasts ADD COLUMN video_thumbnail_url VARCHAR(500) AFTER video_duration');
    }
    
    if (!columnNames.includes('episode_type')) {
      console.log('Adding episode_type column...');
      await db.query("ALTER TABLE podcasts ADD COLUMN episode_type ENUM('audio', 'video') DEFAULT 'audio' AFTER video_thumbnail_url");
    }
    
    console.log('Video fields added to podcasts table successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding video fields:', error);
    process.exit(1);
  }
}

addVideoFieldsToPodcasts();
