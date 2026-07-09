const db = require('../src/config/database');

async function fixMagazineCoverPath() {
  try {
    console.log('Fixing magazine cover image path...\n');
    
    // Check current magazine data
    const [magazines] = await db.query('SELECT id, title, cover_image_url FROM magazines WHERE id = 14');
    console.log('Current magazine data:');
    console.table(magazines);
    
    // Update to point to an existing file
    await db.query(
      'UPDATE magazines SET cover_image_url = ? WHERE id = ?',
      ['/uploads/magazines/cover-1783152605316-273998189.jpeg', 14]
    );
    
    console.log('\n✓ Updated magazine cover image path to: /uploads/magazines/cover-1783152605316-273998189.jpeg');
    
    // Verify the update
    const [updated] = await db.query('SELECT id, title, cover_image_url FROM magazines WHERE id = 14');
    console.log('\nUpdated magazine data:');
    console.table(updated);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixMagazineCoverPath();
