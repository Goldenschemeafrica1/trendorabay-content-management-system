const multer = require('multer');
const { uploadToCloudinary } = require('./cloudinary');
const { uploadToS3 } = require('./s3');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed file types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/png': 'image/png',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
  'application/pdf': 'application/pdf',
  'video/mp4': 'video/mp4',
  'video/mpeg': 'video/mpeg',
  'audio/mpeg': 'audio/mpeg',
  'audio/wav': 'audio/wav',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/docx',
};

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`), false);
  }
};

// Configure multer for Cloudinary storage
const cloudinaryStorage = multer.memoryStorage();

// Configure multer for local storage (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.folder || 'uploads';
    const uploadDir = `uploads/${folder}`;
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

// Determine which storage to use based on environment
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const useS3 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET);

// Choose storage based on configuration
const storage = useCloudinary ? cloudinaryStorage : localStorage;

// Create upload middleware with folder support
const createUpload = (folder = 'uploads', options = {}) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: options.maxSize || 100 * 1024 * 1024, // Default 100MB
      files: options.maxFiles || 10,
    },
  }).fields(options.fields || [{ name: 'file', maxCount: 10 }]);
};

// Single file upload
const uploadSingle = (fieldName, folder = 'uploads', maxSize = 100 * 1024 * 1024) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).single(fieldName);
};

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 10, folder = 'uploads', maxSize = 100 * 1024 * 1024) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize, files: maxCount },
  }).array(fieldName, maxCount);
};

// Fields upload (multiple fields with different names)
const uploadFields = (fields, folder = 'uploads', maxSize = 100 * 1024 * 1024) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).fields(fields);
};

// Helper function to upload file to cloud storage (Cloudinary or S3)
const uploadFileToCloud = async (file, folder = 'uploads') => {
  if (useCloudinary) {
    return await uploadToCloudinary(file, folder);
  }
  if (useS3) {
    return await uploadToS3(file, folder);
  }
  return null;
};

module.exports = {
  createUpload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  useCloudinary,
  useS3,
  uploadFileToCloud,
  ALLOWED_FILE_TYPES,
};
