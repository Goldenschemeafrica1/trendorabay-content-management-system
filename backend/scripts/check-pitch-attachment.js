const db = require('../src/config/database');
require('dotenv').config();

async function checkPitchAttachment() {
  try {
    // Check all pitch submissions with attachments
    const [rows] = await db.query(
      'SELECT id, full_name, pitch_title, article_attachment FROM pitch_submissions WHERE article_attachment IS NOT NULL'
    );
    
    console.log('Pitch submissions with attachments:');
    console.log('==================================');
    
    rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Name: ${row.full_name}`);
      console.log(`Title: ${row.pitch_title}`);
      console.log(`Attachment: ${row.article_attachment}`);
      console.log(`Type: ${row.article_attachment?.startsWith('http') ? 'Cloud/S3 URL' : 'Local path'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPitchAttachment();
