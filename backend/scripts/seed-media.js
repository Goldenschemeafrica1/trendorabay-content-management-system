const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedMedia() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const mediaItems = [
      {
        filename: 'hero-image.jpg',
        original_name: 'hero-image.jpg',
        file_url: '/uploads/media/hero-image.jpg',
        file_type: 'image/jpeg',
        file_size: 2516582, // 2.4 MB in bytes
        folder: 'Blog Posts',
        uploaded_by: null
      },
      {
        filename: 'profile-pic.png',
        original_name: 'profile-pic.png',
        file_url: '/uploads/media/profile-pic.png',
        file_type: 'image/png',
        file_size: 524288, // 512 KB in bytes
        folder: 'Authors',
        uploaded_by: null
      },
      {
        filename: 'magazine-cover.pdf',
        original_name: 'magazine-cover.pdf',
        file_url: '/uploads/media/magazine-cover.pdf',
        file_type: 'application/pdf',
        file_size: 8493465, // 8.1 MB in bytes
        folder: 'Magazines',
        uploaded_by: null
      },
      {
        filename: 'podcast-episode.mp3',
        original_name: 'podcast-episode.mp3',
        file_url: '/uploads/media/podcast-episode.mp3',
        file_type: 'audio/mpeg',
        file_size: 47395638, // 45.2 MB in bytes
        folder: 'Podcasts',
        uploaded_by: null
      },
      {
        filename: 'banner.png',
        original_name: 'banner.png',
        file_url: '/uploads/media/banner.png',
        file_type: 'image/png',
        file_size: 1887436, // 1.8 MB in bytes
        folder: 'Blog Posts',
        uploaded_by: null
      }
    ];

    for (const media of mediaItems) {
      await connection.query(
        'INSERT INTO media (filename, original_name, file_url, file_type, file_size, folder, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [media.filename, media.original_name, media.file_url, media.file_type, media.file_size, media.folder, media.uploaded_by]
      );
      console.log(`Added media: ${media.filename}`);
    }

    console.log('Sample media added successfully');
  } catch (error) {
    console.error('Error seeding media:', error);
  } finally {
    await connection.end();
  }
}

seedMedia();
