const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection pool
// DB_SSL=true is required for TiDB Cloud and other cloud MySQL providers
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ...(process.env.DB_SSL === 'true' && {
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  }),
});

// Get promise-based pool
const promisePool = pool.promise();

// Test database connection with retry (handles cloud DB cold starts)
const testConnection = async (retries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await promisePool.getConnection();
      console.log('✓ MySQL Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      console.error(`✗ MySQL Database connection failed (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt === retries) {
        console.error('Could not connect to MySQL after all retries. Exiting.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = { pool, promisePool, testConnection };
