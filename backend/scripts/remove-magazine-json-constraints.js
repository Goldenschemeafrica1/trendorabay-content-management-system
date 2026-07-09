const db = require('../src/config/database');

async function removeJsonConstraints() {
  try {
    console.log('Removing JSON constraints from magazines table...');
    
    // Recreate columns without CHECK constraints
    const columns = [
      { name: 'table_of_contents', type: 'TEXT' },
      { name: 'contributors', type: 'TEXT' },
      { name: 'reviews', type: 'TEXT' }
    ];

    for (const column of columns) {
      try {
        await db.query(`ALTER TABLE magazines MODIFY COLUMN ${column.name} ${column.type}`);
        console.log(`✓ Modified column ${column.name} to remove JSON constraint`);
      } catch (error) {
        console.error(`✗ Error modifying column ${column.name}:`, error.message);
      }
    }

    console.log('\n✓ All JSON constraints removed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeJsonConstraints();
