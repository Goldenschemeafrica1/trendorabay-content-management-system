const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT || 3306);

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

async function testConnection() {
  try {
    console.log('\nTesting production database connection...');
    const connection = await mysql.createConnection(prodConfig);
    console.log('✅ Connected to production database');

    // Test basic query
    const [rows] = await connection.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME]);
    console.log(`✅ Found ${rows[0].table_count} tables in database`);

    // Test cms_users table
    const [users] = await connection.query('SELECT COUNT(*) as user_count FROM cms_users');
    console.log(`✅ Found ${users[0].user_count} cms_users`);

    await connection.end();
    console.log('\n✅ Connection test successful');
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

testConnection();
