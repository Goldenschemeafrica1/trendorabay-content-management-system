const mysql = require('mysql2');
require('dotenv').config();

// Configure SSL based on environment
const sslConfig = process.env.DB_SSL === 'false' ? false : {
  rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  ...(process.env.DB_CA_CERT && { ca: process.env.DB_CA_CERT })
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000,
  ssl: sslConfig
});

const promisePool = pool.promise();

module.exports = promisePool;
