const db = require('../src/config/database');

async function checkAndAddRefreshTokenColumns() {
  try {
    console.log('Checking cms_users table structure...');
    
    const [columns] = await db.query('DESCRIBE cms_users');
    console.log('Current columns:', columns.map(col => col.Field));
    
    const hasRefreshToken = columns.some(col => col.Field === 'refresh_token');
    const hasRefreshTokenExpiresAt = columns.some(col => col.Field === 'refresh_token_expires_at');
    
    if (!hasRefreshToken) {
      console.log('Adding refresh_token column...');
      await db.query('ALTER TABLE cms_users ADD COLUMN refresh_token VARCHAR(500) UNIQUE');
      console.log('refresh_token column added');
    } else {
      console.log('refresh_token column already exists');
    }
    
    if (!hasRefreshTokenExpiresAt) {
      console.log('Adding refresh_token_expires_at column...');
      await db.query('ALTER TABLE cms_users ADD COLUMN refresh_token_expires_at TIMESTAMP NULL');
      console.log('refresh_token_expires_at column added');
    } else {
      console.log('refresh_token_expires_at column already exists');
    }
    
    console.log('Database schema check complete');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database schema:', error);
    process.exit(1);
  }
}

checkAndAddRefreshTokenColumns();
