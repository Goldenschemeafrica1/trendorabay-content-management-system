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

async function fixSchema() {
  let connection;

  try {
    console.log('Connecting to production database...');
    connection = await mysql.createConnection(prodConfig);
    console.log('✅ Connected to production database');

    console.log('\n' + '='.repeat(60));
    console.log('FIXING PRODUCTION SCHEMA');
    console.log('='.repeat(60));

    // Add missing columns to existing tables
    const alterStatements = [
      // magazines - add reviews column
      "ALTER TABLE magazines ADD COLUMN IF NOT EXISTS reviews TEXT",
      "ALTER TABLE magazines ADD COLUMN IF NOT EXISTS publish_date DATE",
      "ALTER TABLE magazines ADD COLUMN IF NOT EXISTS contributor_id INT(11)",
      
      // authors - add role column
      "ALTER TABLE authors ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Author'",
      
      // stories - add read_time column
      "ALTER TABLE stories ADD COLUMN IF NOT EXISTS read_time VARCHAR(50) DEFAULT '5 min read'",
      "ALTER TABLE stories ADD COLUMN IF NOT EXISTS views INT(11) DEFAULT 0",
      "ALTER TABLE stories ADD COLUMN IF NOT EXISTS contributor_id INT(11)",
      "ALTER TABLE stories MODIFY COLUMN slug VARCHAR(255) NULL",
      
      // products - add badge column
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(100)",
      "ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_color VARCHAR(50)",
      
      // users - add profile_image column
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500)",
      
      // contributors - add user_id column
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS user_id INT(11)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS avatar VARCHAR(500)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS role_type VARCHAR(100)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS expertise TEXT",
      
      // podcasts - add series column
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS series VARCHAR(255)",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS duration VARCHAR(100)",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS host VARCHAR(255)",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS trending TINYINT(1) DEFAULT 0",
      
      // pitch_submissions - add email column
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS phone VARCHAR(50)",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS topic VARCHAR(255)",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS author_bio TEXT",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS social_media VARCHAR(255)",
      
      // team - add linkedin column
      "ALTER TABLE team ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500)",
      
      // contributors - add twitter column
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS twitter VARCHAR(255)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS instagram VARCHAR(255)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500)",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS featured TINYINT(1) DEFAULT 0",
      "ALTER TABLE contributors ADD COLUMN IF NOT EXISTS achievements TEXT",
      
      // podcasts - add status column
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft'",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS related_story_id INT(11)",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS is_featured_guest TINYINT(1) DEFAULT 0",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS audio_data LONGTEXT",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS video_file_url VARCHAR(500)",
      "ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS video_thumbnail_url VARCHAR(500)",
      
      // pitch_submissions - add topics_of_interest column
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS topics_of_interest TEXT",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS previous_publications TEXT",
      "ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS experience TEXT",
      "ALTER TABLE pitch_submissions MODIFY COLUMN submitter_name VARCHAR(255) NULL",
      "ALTER TABLE pitch_submissions MODIFY COLUMN submitter_email VARCHAR(255) NULL"
    ];

    for (const sql of alterStatements) {
      try {
        console.log(`\n📝 Executing: ${sql}`);
        await connection.execute(sql);
        console.log('✅ Success');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠️  Column already exists (skipping)');
        } else if (err.code === 'ER_PARSE_ERROR') {
          console.log('⚠️  Syntax error, trying without IF NOT EXISTS...');
          // Try without IF NOT EXISTS for MySQL versions that don't support it
          const sqlWithoutIfNotExists = sql.replace(' IF NOT EXISTS', '');
          try {
            await connection.execute(sqlWithoutIfNotExists);
            console.log('✅ Success (without IF NOT EXISTS)');
          } catch (err2) {
            if (err2.code === 'ER_DUP_FIELDNAME') {
              console.log('⚠️  Column already exists (skipping)');
            } else {
              console.log(`❌ Error: ${err2.message}`);
            }
          }
        } else {
          console.log(`❌ Error: ${err.message}`);
        }
      }
    }

    // Drop and recreate team table with correct schema
    const dropStatements = [
      "DROP TABLE IF EXISTS team"
    ];

    for (const sql of dropStatements) {
      try {
        console.log(`\n📝 Executing: ${sql}`);
        await connection.execute(sql);
        console.log('✅ Success');
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }
    }

    const createStatements = [
      // team table
      `CREATE TABLE team (
        id INT(11) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        avatar VARCHAR(500) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        social_links LONGTEXT DEFAULT NULL,
        linkedin VARCHAR(500) DEFAULT NULL,
        twitter VARCHAR(500) DEFAULT NULL,
        instagram VARCHAR(500) DEFAULT NULL,
        order_index INT(11) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
        updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id)
      )`,
      
      // likes table
      `CREATE TABLE IF NOT EXISTS likes (
        id INT(11) NOT NULL AUTO_INCREMENT,
        user_id INT(11) DEFAULT NULL,
        story_id INT(11) DEFAULT NULL,
        podcast_id INT(11) DEFAULT NULL,
        magazine_id INT(11) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_user_id (user_id),
        KEY idx_story_id (story_id),
        KEY idx_podcast_id (podcast_id),
        KEY idx_magazine_id (magazine_id)
      )`
    ];

    for (const sql of createStatements) {
      try {
        console.log(`\n📝 Executing: CREATE TABLE`);
        await connection.execute(sql);
        console.log('✅ Success');
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }
    }

    // Add missing column to podcasts
    try {
      console.log(`\n📝 Adding guest column to podcasts...`);
      await connection.execute("ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS guest VARCHAR(255)");
      console.log('✅ Success');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists (skipping)');
      } else if (err.code === 'ER_PARSE_ERROR') {
        try {
          await connection.execute("ALTER TABLE podcasts ADD COLUMN guest VARCHAR(255)");
          console.log('✅ Success (without IF NOT EXISTS)');
        } catch (err2) {
          if (err2.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️  Column already exists (skipping)');
          } else {
            console.log(`❌ Error: ${err2.message}`);
          }
        }
      } else {
        console.log(`❌ Error: ${err.message}`);
      }
    }

    // Add missing column to pitch_submissions
    try {
      console.log(`\n📝 Adding full_name column to pitch_submissions...`);
      await connection.execute("ALTER TABLE pitch_submissions ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)");
      console.log('✅ Success');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column already exists (skipping)');
      } else if (err.code === 'ER_PARSE_ERROR') {
        try {
          await connection.execute("ALTER TABLE pitch_submissions ADD COLUMN full_name VARCHAR(255)");
          console.log('✅ Success (without IF NOT EXISTS)');
        } catch (err2) {
          if (err2.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️  Column already exists (skipping)');
          } else {
            console.log(`❌ Error: ${err2.message}`);
          }
        }
      } else {
        console.log(`❌ Error: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SCHEMA FIX COMPLETED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) await connection.end();
    console.log('\n✅ Connection closed');
  }
}

fixSchema();
