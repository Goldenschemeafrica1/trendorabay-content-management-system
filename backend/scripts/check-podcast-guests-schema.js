const db = require('../src/config/database');

async function checkPodcastGuestsSchema() {
  try {
    console.log('Checking podcast_guests table structure...');
    
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'podcast_guests' 
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Check if all required columns exist
    const requiredColumns = ['id', 'name', 'title', 'bio', 'avatar_url', 'email', 'episode', 'status', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing columns:', missingColumns);
    } else {
      console.log('All required columns exist!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking schema:', error);
    process.exit(1);
  }
}

checkPodcastGuestsSchema();
