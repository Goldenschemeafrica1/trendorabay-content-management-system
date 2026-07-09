const db = require('../src/config/database');

async function addSamplePitch() {
  try {
    console.log('Adding sample pitch submission to existing table...');
    
    await db.query(`
      INSERT INTO pitch_submissions 
      (full_name, email, phone, topic, pitch_title, pitch_description, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Jane Doe',
      'jane.doe@example.com',
      '+1234567890',
      'Technology',
      'The Future of AI in Healthcare',
      'A deep dive into how artificial intelligence is revolutionizing healthcare, from diagnostic tools to personalized medicine.',
      'pending'
    ]);
    
    console.log('✓ Sample pitch submission added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error adding sample pitch:', error.message);
    process.exit(1);
  }
}

addSamplePitch();
