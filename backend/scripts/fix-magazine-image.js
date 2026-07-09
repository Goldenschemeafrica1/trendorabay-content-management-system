const db = require('../src/config/database');

async function fixMagazineImage() {
  try {
    // Update the magazine with incorrect image path to null or a valid path
    const [result] = await db.query(
      'UPDATE magazines SET cover_image_url = NULL WHERE cover_image_url = ?',
      ['/automotives.jpeg']
    );
    
    console.log(`Updated ${result.affectedRows} magazine(s)`);
    console.log('Fixed: Set cover_image_url to NULL for invalid path');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixMagazineImage();
