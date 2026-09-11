const db = require('../../src/config/database');

async function checkData() {
  try {
    console.log('Checking traffic_sources...');
    const [traffic] = await db.query('SELECT * FROM traffic_sources');
    console.log('Traffic sources:', traffic);

    console.log('\nChecking device_types...');
    const [devices] = await db.query('SELECT * FROM device_types');
    console.log('Device types:', devices);

    console.log('\nChecking countries...');
    const [countries] = await db.query('SELECT * FROM countries');
    console.log('Countries:', countries);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
