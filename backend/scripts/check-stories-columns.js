const db = require('../src/config/database');

async function checkStoriesColumns() {
  try {
    console.log('Checking stories table columns...');

    const [columns] = await db.query('DESCRIBE stories');
    console.log('Current columns in stories table:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking columns:', error.message);
    process.exit(1);
  }
}

checkStoriesColumns();
