const db = require('../src/config/database');

async function seedCategories() {
  try {
    // Check existing categories
    const [existingCategories] = await db.query('SELECT * FROM categories');
    console.log('Existing categories:', existingCategories);

    // Categories to seed
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Technology related content' },
      { name: 'Design', slug: 'design', description: 'Design related content' },
      { name: 'Business', slug: 'business', description: 'Business related content' },
      { name: 'Tutorial', slug: 'tutorial', description: 'Tutorial content' },
      { name: 'Music', slug: 'music', description: 'Music related content' },
      { name: 'Sports', slug: 'sports', description: 'Sports related content' },
      { name: 'Finance', slug: 'finance', description: 'Finance related content' },
      { name: 'Culture', slug: 'culture', description: 'Culture related content' },
      { name: 'Art', slug: 'art', description: 'Art related content' },
      { name: 'Travel', slug: 'travel', description: 'Travel related content' },
      { name: 'Tech', slug: 'tech', description: 'Tech related content' }
    ];

    for (const category of categories) {
      // Check if category already exists
      const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [category.slug]);
      
      if (existing.length === 0) {
        // Insert new category
        await db.query(
          'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
          [category.name, category.slug, category.description]
        );
        console.log(`Added category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    // Show final categories
    const [finalCategories] = await db.query('SELECT * FROM categories');
    console.log('\nFinal categories:', finalCategories);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
