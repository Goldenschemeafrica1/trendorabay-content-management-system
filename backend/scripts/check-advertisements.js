const db = require('../src/config/database');

async function checkAdvertisements() {
  try {
    console.log('Fetching advertisements...');
    const [rows] = await db.query('SELECT * FROM advertisements ORDER BY created_at DESC');
    console.log('Total advertisements:', rows.length);
    console.log('\nRaw data:');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      console.log('\nFirst advertisement fields:');
      const firstAd = rows[0];
      Object.keys(firstAd).forEach(key => {
        console.log(`${key}: ${firstAd[key]}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdvertisements();
