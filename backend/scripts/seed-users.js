const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function seedUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      port: 3306,
      database: 'trendorabay'
    });

    console.log('Connected to MySQL server');

    // Hash passwords for all users
    const users = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'admin',
        status: 'active',
        last_active: new Date()
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'user',
        status: 'active',
        last_active: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'user',
        status: 'banned',
        last_active: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'user',
        status: 'active',
        last_active: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        name: 'Eve Wilson',
        email: 'eve@example.com',
        password: await bcrypt.hash('password123', SALT_ROUNDS),
        role: 'user',
        status: 'active',
        last_active: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO cms_users (name, email, password, role, status, last_active) VALUES (?, ?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.role, user.status, user.last_active]
      );
      console.log(`Added user: ${user.name}`);
    }

    await connection.end();
    console.log('Sample users added successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

seedUsers();
