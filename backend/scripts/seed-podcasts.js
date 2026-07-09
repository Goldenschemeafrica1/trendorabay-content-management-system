const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedPodcasts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const podcasts = [
      {
        title: 'Tech Talk Episode 45',
        episode_number: 45,
        description: 'Discussion on the latest technology trends and innovations',
        cover_art_url: null,
        audio_file_url: null,
        category_id: null,
        published_at: '2024-01-15 10:00:00'
      },
      {
        title: 'Design Matters #23',
        episode_number: 23,
        description: 'Weekly design podcast covering creative processes and trends',
        cover_art_url: null,
        audio_file_url: null,
        category_id: null,
        published_at: '2024-01-14 10:00:00'
      },
      {
        title: 'Business Insights #12',
        episode_number: 12,
        description: 'Business analysis and market insights for entrepreneurs',
        cover_art_url: null,
        audio_file_url: null,
        category_id: null,
        published_at: '2024-01-13 10:00:00'
      }
    ];

    for (const podcast of podcasts) {
      await connection.query(
        'INSERT INTO podcasts (title, episode_number, description, cover_art_url, audio_file_url, category_id, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [podcast.title, podcast.episode_number, podcast.description, podcast.cover_art_url, podcast.audio_file_url, podcast.category_id, podcast.published_at]
      );
      console.log(`Added podcast: ${podcast.title}`);
    }

    console.log('Sample podcasts added successfully');
  } catch (error) {
    console.error('Error seeding podcasts:', error);
  } finally {
    await connection.end();
  }
}

seedPodcasts();
