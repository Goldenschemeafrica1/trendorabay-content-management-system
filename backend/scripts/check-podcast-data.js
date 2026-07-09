const db = require('../src/config/database');

async function checkPodcastData() {
  try {
    console.log('Checking podcast cover art URLs in database...\n');
    
    const [rows] = await db.query('SELECT id, title, cover_art_url, audio_file_url FROM podcasts LIMIT 5');
    
    console.log('Podcast data:');
    console.table(rows);
    
    console.log('\nExpected format: /uploads/podcasts/filename.ext');
    console.log('Full URL format: http://localhost:5001/uploads/podcasts/filename.ext');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPodcastData();
