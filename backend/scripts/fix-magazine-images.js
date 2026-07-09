const db = require('../src/config/database');

async function fixMagazineImages() {
  try {
    console.log('Updating magazine cover image URLs to match actual files...');
    
    // Map of existing magazine IDs to actual cover image files
    const magazineImageMap = {
      12: 'magazines/cover-1782980477154-381603408.jpeg',  // parenting
      11: 'magazines/cover-1782980426519-115306802.jpeg',  // matatu culture
      10: 'magazines/cover-1782980383313-107695357.jpeg',  // kids
      9: 'magazines/cover-1782834988823-969538348.jpeg',   // AUTOMOTIVES
      8: 'magazines/cover-1782821411866-556903920.jpeg',   // Gamers
      7: 'magazines/cover-1782821358995-160350706.jpeg',   // fashion & business
      6: 'magazines/cover-1782821221877-39021973.jpeg'     // tech
    };

    for (const [id, imagePath] of Object.entries(magazineImageMap)) {
      await db.query(
        'UPDATE magazines SET cover_image_url = ? WHERE id = ?',
        [imagePath, id]
      );
      console.log(`Updated magazine ${id} to use ${imagePath}`);
    }

    console.log('Magazine cover image URLs updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating magazine images:', error);
    process.exit(1);
  }
}

fixMagazineImages();
