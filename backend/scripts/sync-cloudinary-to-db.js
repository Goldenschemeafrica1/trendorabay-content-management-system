const cloudinary = require('cloudinary').v2;
const db = require('../src/config/database');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function syncCloudinaryToDatabase() {
  try {
    console.log('Fetching files from Cloudinary...');
    
    // Fetch all resources from Cloudinary
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      max_results: 500,
      type: 'upload'
    });
    
    console.log(`Found ${result.resources.length} files in Cloudinary`);
    
    // Clear existing media table
    console.log('Clearing existing media table...');
    await db.query('DELETE FROM media');
    
    // Insert Cloudinary files into database
    for (const resource of result.resources) {
      const folder = resource.folder || 'media';
      const originalName = resource.public_id.split('/').pop();
      const filename = `${originalName}.${resource.format}`;
      const fileUrl = resource.secure_url;
      
      await db.query(
        `INSERT INTO media (filename, file_url, original_name, file_type, file_size, folder, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          filename,
          fileUrl,
          originalName,
          resource.resource_type === 'image' ? `image/${resource.format}` : resource.resource_type,
          resource.bytes || 0,
          folder
        ]
      );
      
      console.log(`✅ Synced: ${originalName} (${folder})`);
    }
    
    console.log('✅ Sync complete! All Cloudinary files are now in the database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing Cloudinary to database:', error);
    process.exit(1);
  }
}

syncCloudinaryToDatabase();
