const mysql = require('mysql2/promise');
require('dotenv').config();

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

async function testLoginData() {
  try {
    console.log('Testing login data in production database...\n');
    const connection = await mysql.createConnection(prodConfig);
    
    // Check cms_users table
    const [cmsUsers] = await connection.query('SELECT id, name, email, role, status FROM cms_users');
    console.log('CMS Users:');
    cmsUsers.forEach(user => {
      console.log(`  ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
    });
    
    // Check users table
    const [users] = await connection.query('SELECT id, cms_user_id, username, email, role FROM users');
    console.log('\nUsers:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}, CMS User ID: ${user.cms_user_id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    await connection.end();
    console.log('\n✅ Login data is accessible in production database');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testLoginData();
