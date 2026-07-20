const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    // Determine resource type based on file mimetype
    const isImage = file.mimetype?.startsWith('image/');
    const isVideo = file.mimetype?.startsWith('video/');
    const isPdf = file.mimetype === 'application/pdf';
    
    const uploadOptions = {
      folder: folder,
      resource_type: isPdf ? 'raw' : (isVideo ? 'video' : (isImage ? 'image' : 'auto')),
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      type: 'upload', // Make files publicly accessible
      access_mode: 'public', // Ensure public access
      use_filename: true,
      unique_filename: true,
    };

    if (file.buffer) {
      // File has buffer (memory storage)
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }).end(file.buffer);
    } else if (file.path) {
      // File has path (disk storage)
      cloudinary.uploader.upload(file.path, uploadOptions, (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });
    } else {
      reject(new Error('No file buffer or path available'));
    }
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (fileUrl) => {
  try {
    // Extract public ID from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = fileUrl.split('/');
    const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
    
    if (versionIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }

    const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`File deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Generate signed URL for private files
const getSignedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    ...options,
    sign_url: true,
    secure: true,
    resource_type: 'auto'
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getSignedUrl,
};
