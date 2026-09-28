const db = require('../src/config/database');

async function seedCategories() {
  try {
    // Check existing categories
    const [existingCategories] = await db.query('SELECT * FROM categories');
    console.log('Existing categories:', existingCategories);

    // Categories to seed
    const categories = [
      { name: 'Music', slug: 'music', description: 'Music related content' },
      { name: 'Fashion', slug: 'fashion', description: 'Fashion related content' },
      { name: 'Art', slug: 'art', description: 'Art related content' },
      { name: 'Technology', slug: 'technology', description: 'Technology related content' },
      { name: 'Agriculture', slug: 'agriculture', description: 'Agriculture related content' },
      { name: 'Business', slug: 'business', description: 'Business related content' },
      { name: 'Sports', slug: 'sports', description: 'Sports related content' },
      { name: 'Food & Nutrition', slug: 'food-nutrition', description: 'Food & Nutrition related content' },
      { name: 'Finance', slug: 'finance', description: 'Finance related content' },
      { name: 'Education', slug: 'education', description: 'Education related content' },
      { name: 'Travel', slug: 'travel', description: 'Travel related content' },
      { name: 'Gaming', slug: 'gaming', description: 'Gaming related content' },
      { name: 'Film', slug: 'film', description: 'Film related content' },
      { name: 'Events', slug: 'events', description: 'Events related content' },
      { name: 'Creative Arts', slug: 'creative-arts', description: 'Creative Arts related content' },
      { name: 'Real Estate', slug: 'real-estate', description: 'Real Estate related content' },
      { name: 'Logistics', slug: 'logistics', description: 'Logistics related content' },
      { name: 'Recycling', slug: 'recycling', description: 'Recycling related content' },
      { name: 'Youth/Student Life', slug: 'youth-student-life', description: 'Youth/Student Life related content' },
      { name: 'Women in Business', slug: 'women-in-business', description: 'Women in Business related content' },
      { name: 'Riders', slug: 'riders', description: 'Riders related content' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle related content' },
      { name: 'Community Impact', slug: 'community-impact', description: 'Community Impact related content' },
      { name: 'Comics', slug: 'comics', description: 'Comics related content' },
      { name: 'Home', slug: 'home', description: 'Home related content' }
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
