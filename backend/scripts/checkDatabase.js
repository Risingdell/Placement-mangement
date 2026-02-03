/**
 * Script to check database connection and data
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  console.log('🔍 Checking database connection and data...\n');

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!\n');

    // Check if users table exists and has data
    const [users] = await connection.query(
      'SELECT id, usn, email, role, LEFT(password_hash, 60) as password_hash FROM users LIMIT 5'
    );

    console.log('📊 Users in database:');
    console.log('=' .repeat(100));
    console.log(users);
    console.log('=' .repeat(100));
    console.log(`\nTotal users found: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️  WARNING: No users found in database!');
      console.log('   Run the dummy_data.sql file to populate the database.\n');
    } else {
      console.log('✅ Users table has data.\n');

      // Test a login attempt
      const [testUser] = await connection.query(
        'SELECT id, email, password_hash FROM users WHERE email = ?',
        ['student@test.com']
      );

      if (testUser.length > 0) {
        console.log('📧 Test user found (student@test.com):');
        console.log(`   ID: ${testUser[0].id}`);
        console.log(`   Email: ${testUser[0].email}`);
        console.log(`   Password Hash: ${testUser[0].password_hash}\n`);

        // Test bcrypt
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare('password123', testUser[0].password_hash);
        console.log(`🔐 Password verification test: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);

        if (!isValid) {
          console.log('   ⚠️  The password hash in the database does not match "password123"');
          console.log('   This could be why login is failing!\n');
        }
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n⚠️  Database does not exist!');
      console.log('   Create it by running: CREATE DATABASE placement_management;');
      console.log('   Then run the schema.sql and dummy_data.sql files.\n');
    }
  }
}

checkDatabase();
