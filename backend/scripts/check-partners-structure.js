const db = require('../src/config/database');

async function checkPartnersStructure() {
  try {
    console.log('Checking partners table structure...');
    const [rows] = await db.query('DESCRIBE partners');
    console.log('\nTable structure:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPartnersStructure();
