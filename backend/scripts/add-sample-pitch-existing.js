const db = require('../src/config/database');

async function addSamplePitch() {
  try {
    console.log('Adding sample pitch submission to existing table...');
    
    await db.query(`
      INSERT INTO pitch_submissions 
      (full_name, email, phone, topic, pitch_title, pitch_description, author_bio, social_media, topics_of_interest, previous_publications, experience, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Jane Doe',
      'jane.doe@example.com',
      '+1234567890',
      'Technology',
      'The Future of AI in Healthcare',
      'A deep dive into how artificial intelligence is revolutionizing healthcare, from diagnostic tools to personalized medicine. We would discuss current applications, ethical considerations, and future predictions with industry experts.',
      'Jane is a tech journalist with 10 years of experience covering healthcare technology.',
      'Twitter: @janedoe, LinkedIn: linkedin.com/in/janedoe',
      'AI, Healthcare, Technology, Medical Innovation',
      'Tech Weekly, Health Magazine, Digital Health Journal',
      '10 years in tech journalism, specialized in healthcare technology',
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
