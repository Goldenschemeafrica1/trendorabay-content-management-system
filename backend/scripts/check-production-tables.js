const mysql = require('mysql2/promise');
require('dotenv').config();

// Production database configuration with SSL
const prodConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkProductionTables() {
  try {
    console.log('Connecting to production database...');
    const connection = await mysql.createConnection(prodConfig);
    console.log('✅ Connected to production database');

    console.log('\n' + '='.repeat(60));
    console.log('PRODUCTION TABLES');
    console.log('='.repeat(60));

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    console.log('\nTables in production:');
    tableNames.forEach(table => console.log(`  - ${table}`));
    console.log(`\nTotal: ${tableNames.length} tables`);

    await connection.end();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkProductionTables();
