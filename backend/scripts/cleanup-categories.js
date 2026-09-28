const db = require('../src/config/database');

async function cleanupCategories() {
  try {
    // The 25 categories to keep
    const categoriesToKeep = [
      'Music',
      'Fashion',
      'Art',
      'Technology',
      'Agriculture',
      'Business',
      'Sports',
      'Food & Nutrition',
      'Finance',
      'Education',
      'Travel',
      'Gaming',
      'Film',
      'Events',
      'Creative Arts',
      'Real Estate',
      'Logistics',
      'Recycling',
      'Youth/Student Life',
      'Women in Business',
      'Riders',
      'Lifestyle',
      'Community Impact',
      'Comics',
      'Home'
    ];

    // Get all current categories
    const [allCategories] = await db.query('SELECT * FROM categories');
    console.log('Current categories in database:', allCategories.length);

    // Find categories to delete
    const categoriesToDelete = allCategories.filter(cat => !categoriesToKeep.includes(cat.name));
    
    console.log('Categories to delete:', categoriesToDelete.length);
    categoriesToDelete.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id})`);
    });

    // Delete the unwanted categories
    for (const category of categoriesToDelete) {
      await db.query('DELETE FROM categories WHERE id = ?', [category.id]);
      console.log(`Deleted: ${category.name}`);
    }

    // Show final categories
    const [finalCategories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    console.log('\nFinal categories:', finalCategories.length);
    finalCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up categories:', error);
    process.exit(1);
  }
}

cleanupCategories();
