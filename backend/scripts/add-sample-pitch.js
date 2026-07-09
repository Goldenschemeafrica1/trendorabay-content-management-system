const db = require('../src/config/database');

async function addSamplePitch() {
  try {
    console.log('Adding sample pitch submission...');
    
    await db.query(`
      INSERT INTO pitch_submissions 
      (submitter_name, submitter_email, submitter_phone, pitch_title, pitch_description, target_audience, episode_format, estimated_duration, key_takeaways, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'John Smith',
      'john.smith@example.com',
      '+1234567890',
      'The Future of AI in Healthcare',
      'A deep dive into how artificial intelligence is revolutionizing healthcare, from diagnostic tools to personalized medicine. We would discuss current applications, ethical considerations, and future predictions with industry experts.',
      'Healthcare professionals, tech enthusiasts, general public',
      'Interview with experts',
      '45 minutes',
      'Understanding AI applications in healthcare, ethical considerations, future trends',
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
