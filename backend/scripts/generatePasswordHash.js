/**
 * Script to generate bcrypt password hashes
 * Usage: node scripts/generatePasswordHash.js
 */

const bcrypt = require('bcryptjs');

// Password to hash
const PASSWORD = 'password123';
const SALT_ROUNDS = 10;

async function generateHash() {
  console.log('🔐 Generating bcrypt password hash...\n');
  console.log(`Password: ${PASSWORD}`);
  console.log(`Salt Rounds: ${SALT_ROUNDS}\n`);

  try {
    // Generate hash
    const hash = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

    console.log('✅ Hash generated successfully!\n');
    console.log('=' .repeat(80));
    console.log('GENERATED HASH:');
    console.log('=' .repeat(80));
    console.log(hash);
    console.log('=' .repeat(80));
    console.log('\n📋 Copy this hash and use it in your dummy_data.sql file');
    console.log('   Replace the placeholder hash with this real hash.\n');

    // Verify the hash works
    const isValid = await bcrypt.compare(PASSWORD, hash);
    console.log(`✓ Verification test: ${isValid ? 'PASSED ✅' : 'FAILED ❌'}\n`);

    // Show SQL update example
    console.log('=' .repeat(80));
    console.log('EXAMPLE SQL UPDATE:');
    console.log('=' .repeat(80));
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE role = 'student';`);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

// Run the script
generateHash();
