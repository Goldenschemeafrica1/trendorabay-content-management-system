const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const products = [
      {
        name: 'CMS T-Shirt',
        description: 'Comfortable cotton t-shirt with CMS logo',
        price: 29.99,
        stock: 45,
        image_url: null,
        category: 'Apparel',
        status: 'active'
      },
      {
        name: 'Tech Mug',
        description: 'Ceramic mug with tech-inspired design',
        price: 19.99,
        stock: 32,
        image_url: null,
        category: 'Accessories',
        status: 'active'
      },
      {
        name: 'Developer Hoodie',
        description: 'Premium hoodie for developers',
        price: 59.99,
        stock: 0,
        image_url: null,
        category: 'Apparel',
        status: 'inactive'
      },
      {
        name: 'Code Notebook',
        description: 'Lined notebook for coding notes',
        price: 14.99,
        stock: 78,
        image_url: null,
        category: 'Stationery',
        status: 'active'
      }
    ];

    for (const product of products) {
      await connection.query(
        'INSERT INTO products (name, description, price, stock, image_url, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.stock, product.image_url, product.category, product.status]
      );
      console.log(`Added product: ${product.name}`);
    }

    console.log('Sample products added successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await connection.end();
  }
}

seedProducts();
