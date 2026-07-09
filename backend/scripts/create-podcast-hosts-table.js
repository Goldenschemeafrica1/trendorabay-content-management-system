const db = require('../src/config/database');

async function createPodcastHostsTable() {
  try {
    console.log('Creating podcast_hosts table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS podcast_hosts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(500),
        email VARCHAR(255),
        social_links JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add host_id column to podcasts table if it doesn't exist
    try {
      await db.query(`ALTER TABLE podcasts ADD COLUMN host_id INT AFTER category_id`);
      await db.query(`ALTER TABLE podcasts ADD FOREIGN KEY (host_id) REFERENCES podcast_hosts(id) ON DELETE SET NULL`);
      console.log('Added host_id column to podcasts table');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('host_id column already exists in podcasts table');
      } else {
        throw error;
      }
    }
    
    console.log('Podcast hosts table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createPodcastHostsTable();
