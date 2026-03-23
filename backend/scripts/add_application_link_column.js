const mysql = require('mysql2/promise');
require('dotenv').config();

async function addApplicationLinkColumn() {
  let conn;
  try {
    console.log('Connecting to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);

    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 4000,
      ssl: process.env.DB_SSL === 'true' ? { mode: 'REQUIRED' } : false
    });

    console.log('✓ Connected to database');
    console.log('Checking if application_link column exists...');

    // Check if column already exists
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'placement_drives' AND COLUMN_NAME = 'application_link'`
    );

    if (rows.length > 0) {
      console.log('✓ application_link column already exists');
      await conn.end();
      return;
    }

    console.log('Adding application_link column to placement_drives table...');

    // Add the column
    await conn.query(
      'ALTER TABLE placement_drives ADD COLUMN application_link VARCHAR(500) AFTER registration_deadline'
    );

    console.log('✓ application_link column added successfully');
    await conn.end();

  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Full Error:', error);
    process.exit(1);
  }
}

addApplicationLinkColumn();
