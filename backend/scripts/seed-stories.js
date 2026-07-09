const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedStories() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const stories = [
      {
        title: 'The Future of Web Development',
        slug: 'future-of-web-development',
        content: 'Web development is evolving rapidly with new technologies and frameworks emerging constantly. In this article, we explore the trends shaping the future of web development...',
        excerpt: 'Exploring the trends shaping the future of web development',
        featured_image_url: null,
        author_id: null,
        category_id: null,
        status: 'published',
        published_at: '2024-01-15 10:00:00'
      },
      {
        title: 'Getting Started with React',
        slug: 'getting-started-with-react',
        content: 'React is a popular JavaScript library for building user interfaces. This guide will help you get started with React development...',
        excerpt: 'A comprehensive guide to getting started with React',
        featured_image_url: null,
        author_id: null,
        category_id: null,
        status: 'draft',
        published_at: null
      },
      {
        title: 'Understanding TypeScript',
        slug: 'understanding-typescript',
        content: 'TypeScript adds type safety to JavaScript, making it easier to catch errors early in development. Learn the fundamentals of TypeScript...',
        excerpt: 'Learn the fundamentals of TypeScript',
        featured_image_url: null,
        author_id: null,
        category_id: null,
        status: 'published',
        published_at: '2024-01-13 10:00:00'
      },
      {
        title: 'CSS Best Practices',
        slug: 'css-best-practices',
        content: 'Writing clean and maintainable CSS is crucial for scalable web applications. Discover the best practices for CSS development...',
        excerpt: 'Best practices for writing clean and maintainable CSS',
        featured_image_url: null,
        author_id: null,
        category_id: null,
        status: 'published',
        published_at: '2024-01-12 10:00:00'
      },
      {
        title: 'JavaScript Performance Tips',
        slug: 'javascript-performance-tips',
        content: 'Optimizing JavaScript performance is essential for creating fast and responsive web applications. Learn key performance optimization techniques...',
        excerpt: 'Key techniques for optimizing JavaScript performance',
        featured_image_url: null,
        author_id: null,
        category_id: null,
        status: 'draft',
        published_at: null
      }
    ];

    for (const story of stories) {
      await connection.query(
        'INSERT INTO stories (title, slug, content, excerpt, featured_image_url, author_id, category_id, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [story.title, story.slug, story.content, story.excerpt, story.featured_image_url, story.author_id, story.category_id, story.status, story.published_at]
      );
      console.log(`Added story: ${story.title}`);
    }

    console.log('Sample stories added successfully');
  } catch (error) {
    console.error('Error seeding stories:', error);
  } finally {
    await connection.end();
  }
}

seedStories();
