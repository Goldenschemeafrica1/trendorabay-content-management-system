const db = require('../src/config/database');

async function createNewTables() {
  try {
    console.log('Creating new tables...');
    
    // Create guest_applications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS guest_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_name VARCHAR(255) NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        applicant_phone VARCHAR(100),
        company_name VARCHAR(255),
        job_title VARCHAR(255),
        bio TEXT,
        expertise_areas TEXT,
        social_links JSON,
        proposed_topics TEXT,
        availability TEXT,
        status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created guest_applications table');
    
    // Create pitch_submissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS pitch_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submitter_name VARCHAR(255) NOT NULL,
        submitter_email VARCHAR(255) NOT NULL,
        submitter_phone VARCHAR(100),
        pitch_title VARCHAR(255) NOT NULL,
        pitch_description TEXT NOT NULL,
        target_audience TEXT,
        episode_format VARCHAR(100),
        estimated_duration VARCHAR(50),
        key_takeaways TEXT,
        additional_resources TEXT,
        status ENUM('pending', 'under_review', 'approved', 'rejected') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created pitch_submissions table');
    
    // Update contact_messages table to include 'pending' status
    await db.query(`
      ALTER TABLE contact_messages 
      MODIFY COLUMN status ENUM('pending', 'unread', 'read', 'replied', 'archived') DEFAULT 'unread'
    `);
    console.log('✓ Updated contact_messages table');
    
    console.log('\n✓ All tables created/updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating tables:', error.message);
    process.exit(1);
  }
}

createNewTables();
