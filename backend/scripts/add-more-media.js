const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function addMoreMedia() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const files = [
    { filename: 'author-avatar-2.jpeg', original_name: 'author-avatar-2.jpeg', folder: 'Authors' },
    { filename: 'magazine-cover-2.jpeg', original_name: 'magazine-cover-2.jpeg', folder: 'Magazines' },
    { filename: 'podcast-cover-1.jpeg', original_name: 'podcast-cover-1.jpeg', folder: 'Podcasts' },
    { filename: 'story-cover-1.jpeg', original_name: 'story-cover-1.jpeg', folder: 'Blog Posts' },
    { filename: 'product-image-1.jpeg', original_name: 'product-image-1.jpeg', folder: 'Merchandise' },
    { filename: 'magazine-cover-3.jpeg', original_name: 'magazine-cover-3.jpeg', folder: 'Magazines' },
    { filename: 'author-avatar-3.jpeg', original_name: 'author-avatar-3.jpeg', folder: 'Authors' }
  ];
  
  for (const file of files) {
    const filePath = `uploads/media/${file.filename}`;
    const stats = fs.statSync(filePath);
    const file_ext = file.filename.split('.').pop();
    const mime_types = { jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', gif: 'image/gif' };
    
    await conn.query(
      'INSERT INTO media (filename, original_name, file_url, file_type, file_size, folder, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [file.filename, file.original_name, `/${filePath}`, mime_types[file_ext] || 'image/jpeg', stats.size, file.folder, null]
    );
    console.log(`Added: ${file.filename}`);
  }
  
  console.log('Additional media files added');
  await conn.end();
}

addMoreMedia();
