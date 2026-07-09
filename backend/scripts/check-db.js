const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      port: 3306,
      database: 'trendorabay'
    });

    console.log('Connected to MySQL server');

    const [rows] = await connection.query('DESCRIBE cms_users');
    console.log('CMS Users table structure:');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
