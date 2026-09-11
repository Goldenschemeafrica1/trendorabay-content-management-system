require('dotenv').config();

console.log('Cloudinary Configuration Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
console.log('\nCloudinary will be used:', useCloudinary ? 'YES' : 'NO');

if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
  console.log('\n⚠️  WARNING: You are using placeholder values!');
  console.log('Please replace them with your actual Cloudinary credentials.');
}
