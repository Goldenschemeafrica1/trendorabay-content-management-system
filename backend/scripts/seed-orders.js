const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedOrders() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trendorabay'
  });

  try {
    console.log('Connected to MySQL server');

    const orders = [
      {
        order_number: 'ORD-001',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        total_amount: 129.99,
        status: 'delivered',
        shipping_address: '123 Main St, City, Country'
      },
      {
        order_number: 'ORD-002',
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        total_amount: 49.99,
        status: 'processing',
        shipping_address: '456 Oak Ave, Town, Country'
      },
      {
        order_number: 'ORD-003',
        customer_name: 'Mike Johnson',
        customer_email: 'mike@example.com',
        total_amount: 249.97,
        status: 'pending',
        shipping_address: '789 Pine Rd, Village, Country'
      },
      {
        order_number: 'ORD-004',
        customer_name: 'Sarah Wilson',
        customer_email: 'sarah@example.com',
        total_amount: 89.98,
        status: 'shipped',
        shipping_address: '321 Elm St, City, Country'
      },
      {
        order_number: 'ORD-005',
        customer_name: 'Tom Brown',
        customer_email: 'tom@example.com',
        total_amount: 39.99,
        status: 'delivered',
        shipping_address: '654 Maple Dr, Town, Country'
      }
    ];

    for (const order of orders) {
      await connection.query(
        'INSERT INTO orders (order_number, customer_name, customer_email, total_amount, status, shipping_address) VALUES (?, ?, ?, ?, ?, ?)',
        [order.order_number, order.customer_name, order.customer_email, order.total_amount, order.status, order.shipping_address]
      );
      console.log(`Added order: ${order.order_number}`);
    }

    console.log('Sample orders added successfully');
  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await connection.end();
  }
}

seedOrders();
