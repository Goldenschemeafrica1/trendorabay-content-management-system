const db = require('../src/config/database');

async function checkInquiryStructure() {
  try {
    console.log('Checking advertisement_inquiries table structure...');
    const [rows] = await db.query('DESCRIBE advertisement_inquiries');
    console.log('\nTable structure:');
    console.table(rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkInquiryStructure();
