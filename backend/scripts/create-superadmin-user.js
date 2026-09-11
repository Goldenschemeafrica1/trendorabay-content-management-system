const db = require('../src/config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function createSuperAdminUser() {
  try {
    console.log('Creating superadmin user...');
    
    const hashedPassword = await bcrypt.hash('superadmin123', SALT_ROUNDS);
    
    const [result] = await db.query(
      `INSERT INTO cms_users (name, email, password, role, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Super Admin', 'superadmin@trendorabay.com', hashedPassword, 'superadmin', 'active']
    );
    
    console.log(`✓ Superadmin user created with ID: ${result.insertId}`);
    console.log('Email: superadmin@trendorabay.com');
    console.log('Password: superadmin123');
    console.log('Role: superadmin');
    console.log('Status: active');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Superadmin user already exists');
    } else {
      console.error('Failed to create superadmin user:', error.message);
    }
    process.exit(1);
  }
}

createSuperAdminUser();
