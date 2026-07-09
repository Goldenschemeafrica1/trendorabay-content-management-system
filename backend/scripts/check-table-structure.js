const db = require('../src/config/database');

async function checkTableStructure() {
  try {
    console.log('Checking advertisements table structure...');
    const [rows] = await db.query('DESCRIBE advertisements');
    console.log('\nTable structure:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTableStructure();
