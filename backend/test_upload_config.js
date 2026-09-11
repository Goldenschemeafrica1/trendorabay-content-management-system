const { useCloudinary, useS3 } = require('./src/config/upload');

console.log('Upload Configuration:');
console.log('useCloudinary:', useCloudinary);
console.log('useS3:', useS3);

if (!useCloudinary && !useS3) {
  console.log('\n⚠️  WARNING: Neither Cloudinary nor S3 is enabled!');
  console.log('Files will be stored locally.');
}
