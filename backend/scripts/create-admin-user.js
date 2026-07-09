const db = require('../src/config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    
    const [result] = await db.query(
      `INSERT INTO cms_users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      ['Admin User', 'admin@cms.com', hashedPassword, 'admin']
    );
    
    console.log(`✓ Admin user created with ID: ${result.insertId}`);
    console.log('Email: admin@cms.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists');
    } else {
      console.error('Failed to create admin user:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser();
