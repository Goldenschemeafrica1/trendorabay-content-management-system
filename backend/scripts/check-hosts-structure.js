const db = require('../src/config/database');

async function checkHostsStructure() {
  try {
    console.log('Checking podcast_hosts table structure...');
    const [rows] = await db.query('DESCRIBE podcast_hosts');
    console.log('\nTable structure:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkHostsStructure();
