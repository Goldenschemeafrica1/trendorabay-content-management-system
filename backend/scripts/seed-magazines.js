const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedMagazines() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const magazines = [
      {
        title: 'Tech Monthly - January 2024',
        issue: 'Vol. 1 No. 1',
        cover_image_url: null,
        pdf_url: null,
        category_id: null,
        published_date: '2024-01-01'
      },
      {
        title: 'Design Weekly - Issue 45',
        issue: 'Vol. 2 No. 10',
        cover_image_url: null,
        pdf_url: null,
        category_id: null,
        published_date: '2024-01-08'
      },
      {
        title: 'Business Review - Q1 2024',
        issue: 'Vol. 3 No. 1',
        cover_image_url: null,
        pdf_url: null,
        category_id: null,
        published_date: '2024-01-15'
      }
    ];

    for (const magazine of magazines) {
      await connection.query(
        'INSERT INTO magazines (title, issue, cover_image_url, pdf_url, category_id, published_date) VALUES (?, ?, ?, ?, ?, ?)',
        [magazine.title, magazine.issue, magazine.cover_image_url, magazine.pdf_url, magazine.category_id, magazine.published_date]
      );
      console.log(`Added magazine: ${magazine.title}`);
    }

    console.log('Sample magazines added successfully');
  } catch (error) {
    console.error('Error seeding magazines:', error);
  } finally {
    await connection.end();
  }
}

seedMagazines();
