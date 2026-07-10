const mysql = require('mysql2/promise');

async function checkLocalData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '244466666',
      database: 'trendorabay',
      port: 3306
    });

    console.log('Connected to local database\n');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    console.log('Tables and their row counts:');
    console.log('='.repeat(50));

    for (const table of tableNames) {
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${count[0].count} rows`);
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkLocalData();
