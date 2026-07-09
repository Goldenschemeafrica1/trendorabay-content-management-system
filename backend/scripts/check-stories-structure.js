const db = require('../src/config/database');

async function checkStoriesStructure() {
  try {
    // Check stories table structure
    console.log('Stories table structure:');
    const [structure] = await db.query('DESCRIBE stories');
    console.log(structure);

    // Check sample data
    console.log('\nSample stories data:');
    const [stories] = await db.query('SELECT * FROM stories LIMIT 5');
    console.log(JSON.stringify(stories, null, 2));

    // Check if there are any stories with missing fields
    console.log('\nChecking for stories with missing fields...');
    const [missingFields] = await db.query(`
      SELECT id, title, author_id, category_id, status 
      FROM stories 
      WHERE author_id IS NULL OR category_id IS NULL
    `);
    console.log('Stories with missing author_id or category_id:', missingFields);

    process.exit(0);
  } catch (error) {
    console.error('Error checking stories structure:', error);
    process.exit(1);
  }
}

checkStoriesStructure();
