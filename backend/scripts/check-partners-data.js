const db = require('../src/config/database');

async function checkPartnersData() {
  try {
    console.log('Fetching partners...');
    const [rows] = await db.query('SELECT * FROM partners ORDER BY created_at DESC');
    console.log('Total partners:', rows.length);
    console.log('\nRaw data:');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      console.log('\nFirst partner fields:');
      const firstPartner = rows[0];
      Object.keys(firstPartner).forEach(key => {
        console.log(`${key}: ${firstPartner[key]}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPartnersData();
