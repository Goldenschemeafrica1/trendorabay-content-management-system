const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      port: 3306
    });

    console.log('Connected to MySQL server');

    const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const trimmed = statement.trim();
        if (trimmed.startsWith('USE ') || trimmed.startsWith('CREATE DATABASE')) {
          await connection.query(trimmed);
        } else {
          await connection.query(trimmed);
        }
        console.log('Executed:', trimmed.substring(0, 50) + '...');
      }
    }

    await connection.end();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initDatabase();
