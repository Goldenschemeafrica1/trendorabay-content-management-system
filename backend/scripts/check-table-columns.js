const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'false' ? false : {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  }
});

const promisePool = pool.promise();

async function checkTableColumns() {
  try {
    console.log('Checking podcasts table columns...');
    const [podcastsColumns] = await promisePool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'podcasts'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);
    
    console.log('\nPodcasts table columns:');
    podcastsColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    console.log('\nChecking events table columns...');
    const [eventsColumns] = await promisePool.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);
    
    console.log('\nEvents table columns:');
    eventsColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Check for missing video_file_url in podcasts
    const hasVideoFileUrl = podcastsColumns.some(col => col.COLUMN_NAME === 'video_file_url');
    if (!hasVideoFileUrl) {
      console.log('\n❌ MISSING: video_file_url column in podcasts table');
    } else {
      console.log('\n✓ video_file_url column exists in podcasts table');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await promisePool.end();
  }
}

checkTableColumns();
