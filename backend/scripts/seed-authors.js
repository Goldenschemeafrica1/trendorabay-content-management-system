const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAuthors() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const authors = [
      {
        name: 'John Doe',
        bio: 'Senior tech writer with 10 years of experience',
        avatar_url: null,
        email: 'john@example.com',
        social_links: null
      },
      {
        name: 'Jane Smith',
        bio: 'Design enthusiast and creative director',
        avatar_url: null,
        email: 'jane@example.com',
        social_links: null
      },
      {
        name: 'Mike Johnson',
        bio: 'Business analyst and consultant',
        avatar_url: null,
        email: 'mike@example.com',
        social_links: null
      }
    ];

    for (const author of authors) {
      await connection.query(
        'INSERT INTO authors (name, bio, avatar_url, email, social_links) VALUES (?, ?, ?, ?, ?)',
        [author.name, author.bio, author.avatar_url, author.email, author.social_links]
      );
      console.log(`Added author: ${author.name}`);
    }

    console.log('Sample authors added successfully');
  } catch (error) {
    console.error('Error seeding authors:', error);
  } finally {
    await connection.end();
  }
}

seedAuthors();
