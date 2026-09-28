const db = require('../src/config/database');

async function removeDuplicateTech() {
  try {
    // Delete the Technology entry with empty slug (ID: 32)
    await db.query('DELETE FROM categories WHERE id = 32');
    console.log('Deleted duplicate Technology entry with empty slug');

    // Show final categories
    const [finalCategories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    console.log('\nFinal categories:', finalCategories.length);
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error removing duplicate:', error);
    process.exit(1);
  }
}

removeDuplicateTech();
