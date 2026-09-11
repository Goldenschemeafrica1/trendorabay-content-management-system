const db = require('../../src/config/database');

async function checkTables() {
  try {
    console.log('Checking for trendorabay tables...');
    
    const [tables] = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE 'trendorabay%'
    `);
    
    console.log('Found tables:', tables.map(t => t.table_name));
    
    if (tables.length === 0) {
      console.log('No trendorabay tables found. Running migration...');
      return;
    }
    
    for (const table of tables) {
      const [count] = await db.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
      console.log(`${table.table_name}: ${count[0].count} rows`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
