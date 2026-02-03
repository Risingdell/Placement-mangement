/**
 * Script to update user passwords in database with correct bcrypt hash
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// The correct bcrypt hash for "password123"
const CORRECT_HASH = '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi';

async function updatePasswords() {
  console.log('🔧 Updating password hashes in database...\n');

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful!\n');

    // Verify the hash works
    const isValid = await bcrypt.compare('password123', CORRECT_HASH);
    if (!isValid) {
      console.error('❌ ERROR: The bcrypt hash is invalid!');
      process.exit(1);
    }

    console.log('✅ Hash verified successfully\n');

    // Get all users with placeholder hashes
    const [users] = await connection.query(
      `SELECT id, email, usn FROM users
       WHERE password_hash LIKE '$2a$10$YourHashedPasswordHere%'
       OR password_hash = 'password123'`
    );

    console.log(`📝 Found ${users.length} users with placeholder passwords\n`);

    if (users.length === 0) {
      console.log('✅ No users need password updates!\n');
      await connection.end();
      return;
    }

    console.log('Updating passwords for:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.usn})`);
    });
    console.log('');

    // Update all users
    const [result] = await connection.query(
      `UPDATE users
       SET password_hash = ?
       WHERE password_hash LIKE '$2a$10$YourHashedPasswordHere%'
       OR password_hash = 'password123'`,
      [CORRECT_HASH]
    );

    console.log(`✅ Successfully updated ${result.affectedRows} user passwords!\n`);

    // Verify the update
    const [testUser] = await connection.query(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      ['student@test.com']
    );

    if (testUser.length > 0) {
      const testValid = await bcrypt.compare('password123', testUser[0].password_hash);
      console.log('🔐 Verification test for student@test.com:');
      console.log(`   Result: ${testValid ? '✅ PASSED' : '❌ FAILED'}\n`);

      if (testValid) {
        console.log('🎉 All done! You can now login with:');
        console.log('   Email: student@test.com');
        console.log('   Password: password123\n');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
