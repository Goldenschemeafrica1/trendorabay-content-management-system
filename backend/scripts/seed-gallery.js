const db = require('../src/config/database');

async function seedGallery() {
  try {
    console.log('Seeding gallery table with sample data...');
    
    const sampleItems = [
      {
        title: 'Beach Sunset',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        caption: 'Beautiful sunset at the beach',
        category: 'Nature',
        featured: 1,
        likes_count: 45
      },
      {
        title: 'Mountain View',
        image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        caption: 'Stunning mountain landscape',
        category: 'Nature',
        featured: 1,
        likes_count: 32
      },
      {
        title: 'City Lights',
        image_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
        caption: 'City skyline at night',
        category: 'Urban',
        featured: 0,
        likes_count: 28
      },
      {
        title: 'Forest Path',
        image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        caption: 'Peaceful forest walk',
        category: 'Nature',
        featured: 0,
        likes_count: 19
      },
      {
        title: 'Ocean Waves',
        image_url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
        caption: 'Powerful ocean waves',
        category: 'Nature',
        featured: 1,
        likes_count: 56
      },
      {
        title: 'Desert Dunes',
        image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        caption: 'Golden desert sand dunes',
        category: 'Nature',
        featured: 0,
        likes_count: 23
      }
    ];
    
    for (const item of sampleItems) {
      await db.query(
        `INSERT INTO gallery (title, image_url, caption, category, featured, likes_count) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [item.title, item.image_url, item.caption, item.category, item.featured, item.likes_count]
      );
    }
    
    console.log('Gallery seeded successfully with', sampleItems.length, 'items');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding gallery:', error.message);
    process.exit(1);
  }
}

seedGallery();
