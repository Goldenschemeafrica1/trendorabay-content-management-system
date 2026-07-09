const mysql = require('mysql2/promise');

async function listUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      port: 3306,
      database: 'trendorabay'
    });

    console.log('Connected to MySQL server');

    const [rows] = await connection.query('SELECT * FROM cms_users');
    console.log('CMS Users in database:');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('Error listing users:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

listUsers();
