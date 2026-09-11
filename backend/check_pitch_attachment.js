const db = require('./src/config/database');

async function checkPitchAttachment() {
  try {
    const [rows] = await db.query(`
      SELECT id, pitch_title, article_attachment, created_at 
      FROM pitch_submissions 
      WHERE article_attachment IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('Recent pitch submissions with attachments:');
    rows.forEach(row => {
      console.log('\n---');
      console.log('ID:', row.id);
      console.log('Title:', row.pitch_title);
      console.log('Attachment:', row.article_attachment);
      console.log('Is Cloudinary URL:', row.article_attachment?.startsWith('http') ? 'YES' : 'NO');
      console.log('Created:', row.created_at);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPitchAttachment();
