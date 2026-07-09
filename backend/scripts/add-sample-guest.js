const db = require('../src/config/database');

async function addSampleGuest() {
  try {
    console.log('Adding sample guest application...');
    
    await db.query(`
      INSERT INTO guest_applications 
      (applicant_name, applicant_email, applicant_phone, company_name, job_title, bio, expertise_areas, social_links, proposed_topics, availability, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'John Smith',
      'john.smith@example.com',
      '+1234567890',
      'Tech Innovations Inc',
      'Senior Software Engineer',
      'John is a senior software engineer with 15 years of experience in building scalable web applications and cloud infrastructure. He has worked with Fortune 500 companies and startups alike.',
      'Cloud Computing, Web Development, AI/ML, DevOps, Software Architecture',
      JSON.stringify({
        linkedin: 'linkedin.com/in/johnsmith',
        twitter: '@johnsmith',
        github: 'github.com/johnsmith'
      }),
      'The Future of Cloud Computing, Building Scalable Systems, AI in Software Development',
      'Available weekdays after 6 PM EST, weekends flexible',
      'pending'
    ]);
    
    console.log('✓ Sample guest application added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error adding sample guest:', error.message);
    process.exit(1);
  }
}

addSampleGuest();
