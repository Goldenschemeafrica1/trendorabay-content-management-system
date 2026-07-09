const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const { uploadToS3 } = require('./s3');
require('dotenv').config();

// Initialize S3 client for multer
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET;

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

// Configure multer for S3 uploads
const s3Storage = multerS3({
  s3: s3Client,
  bucket: S3_BUCKET,
  acl: 'public-read', // Make files publicly accessible
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const folder = req.folder || 'uploads';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${folder}/${uniqueSuffix}.${ext}`);
  },
});

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
const useS3 = process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

// Create upload middleware with folder support
const createUpload = (folder = 'uploads', options = {}) => {
  return multer({
    storage: useS3 ? s3Storage : localStorage,
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
    storage: useS3 ? s3Storage : localStorage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).single(fieldName);
};

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 10, folder = 'uploads', maxSize = 100 * 1024 * 1024) => {
  return multer({
    storage: useS3 ? s3Storage : localStorage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize, files: maxCount },
  }).array(fieldName, maxCount);
};

// Fields upload (multiple fields with different names)
const uploadFields = (fields, folder = 'uploads', maxSize = 100 * 1024 * 1024) => {
  return multer({
    storage: useS3 ? s3Storage : localStorage,
    fileFilter: fileFilter,
    limits: { fileSize: maxSize },
  }).fields(fields);
};

module.exports = {
  createUpload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  useS3,
  ALLOWED_FILE_TYPES,
};
