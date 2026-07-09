const mysql = require('mysql2/promise');

async function recreateDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      port: 3306
    });

    console.log('Connected to MySQL server');

    await connection.query('DROP DATABASE IF EXISTS trendorabay');
    console.log('Dropped existing database');

    await connection.query('CREATE DATABASE trendorabay');
    console.log('Created new database');

    await connection.end();
    console.log('Database recreated successfully');
  } catch (error) {
    console.error('Error recreating database:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

recreateDatabase();
