const db = require('./src/config/database');

async function checkRecentPitch() {
  try {
    const [rows] = await db.query(`
      SELECT id, pitch_title, article_attachment, created_at 
      FROM pitch_submissions 
      WHERE article_attachment LIKE '%1784455939642%'
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      console.log('Recent pitch submission:');
      console.log('ID:', rows[0].id);
      console.log('Title:', rows[0].pitch_title);
      console.log('Attachment:', rows[0].article_attachment);
      console.log('Is Cloudinary URL:', rows[0].article_attachment?.startsWith('http') ? 'YES' : 'NO');
      console.log('Created:', rows[0].created_at);
    } else {
      console.log('No pitch found with that timestamp');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRecentPitch();
