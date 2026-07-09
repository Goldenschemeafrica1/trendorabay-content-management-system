const db = require('../src/config/database');

async function inspectTable() {
  try {
    console.log('Checking guest_applications table structure...');
    
    const [rows] = await db.query('DESCRIBE guest_applications');
    console.log('Table structure:');
    rows.forEach(row => {
      console.log(`  ${row.Field} - ${row.Type} - ${row.Null} - ${row.Key} - ${row.Default}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error inspecting table:', error.message);
    process.exit(1);
  }
}

inspectTable();
