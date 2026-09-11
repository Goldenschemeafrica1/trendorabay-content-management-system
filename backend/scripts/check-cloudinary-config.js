require('dotenv').config();
const { useCloudinary, useS3 } = require('../src/config/upload');

console.log('Cloudinary configured:', useCloudinary);
console.log('S3 configured:', useS3);
console.log('Cloudinary cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Cloudinary API key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('Cloudinary API secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
