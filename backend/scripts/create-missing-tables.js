const mysql = require('mysql2/promise');
require('dotenv').config();

// Production database configuration with SSL
const prodConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

async function createMissingTables() {
  let connection;

  try {
    console.log('Connecting to production database...');
    connection = await mysql.createConnection(prodConfig);
    console.log('✅ Connected to production database');

    console.log('\n' + '='.repeat(60));
    console.log('CREATING MISSING TABLES');
    console.log('='.repeat(60));

    const createStatements = [
      // author_follows
      `CREATE TABLE IF NOT EXISTS author_follows (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        author_id int(11) NOT NULL,
        followed_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY unique_user_author (user_id, author_id),
        KEY idx_user_id (user_id),
        KEY idx_author_id (author_id)
      )`,
      
      // comments
      `CREATE TABLE IF NOT EXISTS comments (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) DEFAULT NULL,
        story_id int(11) DEFAULT NULL,
        content text NOT NULL,
        parent_id int(11) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      )`,
      
      // contributor_follows
      `CREATE TABLE IF NOT EXISTS contributor_follows (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        contributor_id int(11) NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY unique_follow (user_id, contributor_id),
        KEY idx_contributor_follows_contributor_id (contributor_id),
        KEY idx_contributor_follows_user_id (user_id)
      )`,
      
      // homepage_config
      `CREATE TABLE IF NOT EXISTS homepage_config (
        id int(11) NOT NULL AUTO_INCREMENT,
        section_name varchar(100) NOT NULL,
        config longtext NOT NULL,
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY section_name (section_name)
      )`,
      
      // homepage_featured
      `CREATE TABLE IF NOT EXISTS homepage_featured (
        id int(11) NOT NULL AUTO_INCREMENT,
        content_type enum('story','magazine','event','product') NOT NULL,
        content_id int(11) NOT NULL,
        position int(11) DEFAULT 0,
        section varchar(100) NOT NULL,
        status enum('active','inactive') DEFAULT 'active',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      )`,
      
      // partnership_proposals
      `CREATE TABLE IF NOT EXISTS partnership_proposals (
        id int(11) NOT NULL AUTO_INCREMENT,
        company_name varchar(255) NOT NULL,
        contact_person varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(50) DEFAULT NULL,
        partnership_type varchar(100) NOT NULL,
        message text DEFAULT NULL,
        status enum('pending','reviewed','accepted','rejected') DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      )`,
      
      // podcast_guest_applications
      `CREATE TABLE IF NOT EXISTS podcast_guest_applications (
        id int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(50) DEFAULT NULL,
        bio text NOT NULL,
        topic text NOT NULL,
        social_media text DEFAULT NULL,
        status enum('pending','approved','rejected') DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      )`,
      
      // shares
      `CREATE TABLE IF NOT EXISTS shares (
        id int(11) NOT NULL AUTO_INCREMENT,
        story_id int(11) DEFAULT NULL,
        user_id int(11) DEFAULT NULL,
        platform varchar(50) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id)
      )`
    ];

    for (const sql of createStatements) {
      try {
        console.log(`\n📝 Creating table...`);
        await connection.execute(sql);
        console.log('✅ Success');
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('MISSING TABLES CREATED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    console.log('\n✅ Connection closed');
  }
}

createMissingTables();
