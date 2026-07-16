const db = require('../src/config/database');

async function checkGalleryData() {
  try {
    console.log('Checking gallery table data...');
    
    const [rows] = await db.query('SELECT * FROM gallery');
    
    console.log('Total items:', rows.length);
    console.log('\nGallery items:');
    rows.forEach((item, index) => {
      console.log(`\n${index + 1}. ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   Image URL: ${item.image_url}`);
      console.log(`   Caption: ${item.caption}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Featured: ${item.featured}`);
      console.log(`   Likes: ${item.likes_count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking gallery data:', error.message);
    process.exit(1);
  }
}

checkGalleryData();
