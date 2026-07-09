const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedAnalytics() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    // Seed page views data - matching actual schema
    const pageViews = [
      { page_url: '/homepage', view_count: 1250, date: '2024-01-15' },
      { page_url: '/homepage', view_count: 1420, date: '2024-01-14' },
      { page_url: '/stories/latest', view_count: 890, date: '2024-01-15' },
      { page_url: '/stories/latest', view_count: 1020, date: '2024-01-14' },
      { page_url: '/magazines/latest', view_count: 675, date: '2024-01-15' },
      { page_url: '/magazines/latest', view_count: 750, date: '2024-01-14' },
      { page_url: '/podcasts/episodes', view_count: 540, date: '2024-01-15' },
      { page_url: '/podcasts/episodes', view_count: 480, date: '2024-01-14' },
      { page_url: '/about', view_count: 420, date: '2024-01-15' },
      { page_url: '/about', view_count: 380, date: '2024-01-14' }
    ];

    for (const view of pageViews) {
      await connection.query(
        'INSERT INTO page_views (page_url, view_count, date) VALUES (?, ?, ?)',
        [view.page_url, view.view_count, view.date]
      );
    }
    console.log('Added page views data');

    console.log('Sample analytics data added successfully');
  } catch (error) {
    console.error('Error seeding analytics:', error);
  } finally {
    await connection.end();
  }
}

seedAnalytics();
