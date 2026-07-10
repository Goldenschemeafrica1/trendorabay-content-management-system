const mysql = require('mysql2/promise');
require('dotenv').config();

// Local database configuration
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: '244466666',
  database: 'trendorabay',
  port: 3306
};

// Production database configuration (from current env)
const prodConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

async function migrateUsers() {
  let localConnection;
  let prodConnection;

  try {
    console.log('Connecting to local database...');
    localConnection = await mysql.createConnection(localConfig);
    console.log('Connected to local database');

    console.log('Connecting to production database...');
    prodConnection = await mysql.createConnection(prodConfig);
    console.log('Connected to production database');

    // Get users from local database
    console.log('\nFetching users from local database...');
    const [localUsers] = await localConnection.execute(
      'SELECT id, name, email, password, role, status, profile_image_url FROM cms_users'
    );
    console.log(`Found ${localUsers.length} users in local database`);

    // Get existing users from production to avoid conflicts
    console.log('\nChecking existing users in production...');
    const [prodUsers] = await prodConnection.execute(
      'SELECT email FROM cms_users'
    );
    const existingEmails = new Set(prodUsers.map(u => u.email));
    console.log(`Found ${prodUsers.length} existing users in production`);

    // Migrate users
    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of localUsers) {
      if (existingEmails.has(user.email)) {
        console.log(`\n⚠️  Skipping ${user.email} - already exists in production`);
        skippedCount++;
        continue;
      }

      console.log(`\n📝 Migrating: ${user.email} (${user.name})`);
      
      // Insert into cms_users
      await prodConnection.execute(
        `INSERT INTO cms_users (name, email, password, role, status, profile_image_url, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [user.name, user.email, user.password, user.role, user.status, user.profile_image_url]
      );

      // Get the new user ID
      const [insertedUser] = await prodConnection.execute(
        'SELECT id FROM cms_users WHERE email = ?',
        [user.email]
      );
      const newUserId = insertedUser[0].id;

      // Insert into users table for user management
      await prodConnection.execute(
        `INSERT INTO users (cms_user_id, username, email, role, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [newUserId, user.name, user.email, user.role]
      );

      console.log(`✅ Successfully migrated ${user.email} (new ID: ${newUserId})`);
      migratedCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log(`✅ Migrated: ${migratedCount} users`);
    console.log(`⚠️  Skipped: ${skippedCount} users (already exist)`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (localConnection) await localConnection.end();
    if (prodConnection) await prodConnection.end();
    console.log('\nConnections closed');
  }
}

// Run migration
migrateUsers();
