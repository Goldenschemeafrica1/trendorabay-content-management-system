const db = require('../src/config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashExistingPasswords() {
  try {
    console.log('Fetching existing users...');
    const [users] = await db.query('SELECT id, name, email, password FROM cms_users');
    
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
      if (user.password.startsWith('$2')) {
        console.log(`User ${user.email} already has hashed password, skipping`);
        continue;
      }
      
      console.log(`Hashing password for user: ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
      
      await db.query(
        'UPDATE cms_users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`✓ Password hashed for ${user.email}`);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

hashExistingPasswords();
