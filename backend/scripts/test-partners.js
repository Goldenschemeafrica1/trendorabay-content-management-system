const db = require('../src/config/database');

async function testPartners() {
  try {
    console.log('Testing database connection...');
    
    // Check if partners table exists
    const [tables] = await db.query("SHOW TABLES LIKE 'partners'");
    console.log('Partners table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const [columns] = await db.query("DESCRIBE partners");
      console.log('Partners table structure:', columns);
      
      // Try to query partners
      const [partners] = await db.query('SELECT * FROM partners');
      console.log('Partners count:', partners.length);
      console.log('Partners data:', partners);
    } else {
      console.log('Partners table does not exist!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing partners:', error);
    process.exit(1);
  }
}

testPartners();
