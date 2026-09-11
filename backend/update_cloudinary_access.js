const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function updateFileAccess() {
  try {
    // The public ID from the URL: pitch-submissions/TRENDORABAY_COMPLETE_DOCUMENTATION_qhix9f
    const publicId = 'pitch-submissions/TRENDORABAY_COMPLETE_DOCUMENTATION_qhix9f';
    
    console.log('Updating access mode for:', publicId);
    
    // Update the resource to make it public
    const result = await cloudinary.api.update(publicId, {
      access_mode: 'public',
      type: 'upload'
    });
    
    console.log('Successfully updated file access mode:', result);
    console.log('File is now publicly accessible');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating file access:', error);
    process.exit(1);
  }
}

updateFileAccess();
