const db = require('../src/config/database');
require('dotenv').config();

async function checkAllPitches() {
  try {
    const [rows] = await db.query(
      'SELECT id, full_name, pitch_title, article_attachment, created_at FROM pitch_submissions ORDER BY created_at DESC'
    );
    
    console.log(`Total pitch submissions: ${rows.length}`);
    console.log('========================');
    
    rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Name: ${row.full_name}`);
      console.log(`Title: ${row.pitch_title}`);
      console.log(`Created: ${row.created_at}`);
      console.log(`Attachment: ${row.article_attachment || 'None'}`);
      if (row.article_attachment) {
        console.log(`Type: ${row.article_attachment.startsWith('http') ? 'Cloud/S3 URL' : 'Local path'}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllPitches();
