const db = require('../../src/config/database');

async function checkDatabase() {
  try {
    const [result] = await db.query('SELECT DATABASE() as db_name');
    console.log('Current database:', result[0].db_name);
    
    const [tables] = await db.query('SHOW TABLES');
    console.log('All tables in database:', tables.map(t => Object.values(t)[0]));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
