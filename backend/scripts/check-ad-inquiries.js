const db = require('../src/config/database');

async function checkAdInquiries() {
  try {
    console.log('Fetching advertisement inquiries...');
    const [rows] = await db.query('SELECT * FROM advertisement_inquiries ORDER BY created_at DESC');
    console.log('Total inquiries:', rows.length);
    console.log('\nRaw data:');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      console.log('\nFirst inquiry fields:');
      const firstInquiry = rows[0];
      Object.keys(firstInquiry).forEach(key => {
        console.log(`${key}: ${firstInquiry[key]}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdInquiries();
