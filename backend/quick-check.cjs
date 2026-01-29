/**
 * Quick System Check Script
 * Verifies database, backend, and frontend are all working
 */

const mysql = require('mysql2/promise');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

async function checkDatabase() {
  section('1. Checking Database Connection');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'placement_management',
      port: 3306
    });

    log('✓ Database connection successful!', colors.green);

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');

    if (tables.length > 0) {
      log(`✓ Found ${tables.length} tables in database`, colors.green);
      console.log('\nTables:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });

      // Check critical tables
      const requiredTables = ['users', 'student_academics', 'password_reset_tokens'];
      const existingTables = tables.map(t => Object.values(t)[0]);

      console.log('\nCritical Tables Check:');
      requiredTables.forEach(table => {
        if (existingTables.includes(table)) {
          log(`  ✓ ${table}`, colors.green);
        } else {
          log(`  ✗ ${table} - MISSING!`, colors.red);
        }
      });

      // Count users
      const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
      log(`\n✓ Users in database: ${userCount[0].count}`, colors.green);

    } else {
      log('⚠ Database is empty - no tables found', colors.yellow);
      log('  Run schema.sql to create tables', colors.yellow);
    }

    await connection.end();
    return true;

  } catch (error) {
    log('✗ Database connection failed!', colors.red);
    console.log('  Error:', error.message);

    if (error.code === 'ER_BAD_DB_ERROR') {
      log('\n  Database "placement_management" does not exist!', colors.yellow);
      log('  Create it with: CREATE DATABASE placement_management;', colors.yellow);
    } else if (error.code === 'ECONNREFUSED') {
      log('\n  MySQL server is not running!', colors.yellow);
      log('  Start MySQL in XAMPP Control Panel', colors.yellow);
    }

    return false;
  }
}

async function checkBackend() {
  section('2. Checking Backend Server');

  try {
    const response = await fetch('http://localhost:5000/health');

    if (response.ok) {
      const data = await response.json();
      log('✓ Backend server is running!', colors.green);
      console.log('  Status:', data.status);
      console.log('  Message:', data.message);
      return true;
    } else {
      log('✗ Backend responded with error', colors.red);
      console.log('  Status:', response.status);
      return false;
    }
  } catch (error) {
    log('✗ Backend server is not reachable!', colors.red);
    console.log('  Error:', error.message);
    log('\n  Start backend with:', colors.yellow);
    log('  cd backend && npm run dev', colors.yellow);
    return false;
  }
}

async function checkFrontend() {
  section('3. Checking Frontend Server');

  try {
    const response = await fetch('http://localhost:5173/');

    if (response.ok) {
      log('✓ Frontend server is running!', colors.green);
      return true;
    } else {
      log('⚠ Frontend responded with status: ' + response.status, colors.yellow);
      return true; // Still running, just unexpected status
    }
  } catch (error) {
    log('✗ Frontend server is not reachable!', colors.red);
    console.log('  Error:', error.message);
    log('\n  Start frontend with:', colors.yellow);
    log('  npm run dev', colors.yellow);
    return false;
  }
}

async function testAuthEndpoints() {
  section('4. Testing Auth Endpoints');

  try {
    // Test login endpoint with invalid credentials (just to check it responds)
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 200) {
      log('✓ Auth endpoints are responding!', colors.green);
      console.log('  Status:', response.status);
      console.log('  Message:', data.message);
      return true;
    } else {
      log('⚠ Unexpected response from auth endpoint', colors.yellow);
      console.log('  Status:', response.status);
      console.log('  Response:', data);
      return false;
    }
  } catch (error) {
    log('✗ Auth endpoint test failed!', colors.red);
    console.log('  Error:', error.message);
    return false;
  }
}

async function runChecks() {
  console.clear();
  log('\n╔══════════════════════════════════════════════════════════╗', colors.blue);
  log('║          PLACEMENT SYSTEM - QUICK STATUS CHECK          ║', colors.blue);
  log('╚══════════════════════════════════════════════════════════╝', colors.blue);

  const results = {
    database: false,
    backend: false,
    frontend: false,
    authEndpoints: false
  };

  results.database = await checkDatabase();
  results.backend = await checkBackend();

  if (results.backend && results.database) {
    results.authEndpoints = await testAuthEndpoints();
  } else {
    log('\n⚠ Skipping auth endpoint test (prerequisites not met)', colors.yellow);
  }

  results.frontend = await checkFrontend();

  // Summary
  section('Summary');

  const statuses = {
    database: results.database ? '✓ Online' : '✗ Offline',
    backend: results.backend ? '✓ Running' : '✗ Not Running',
    frontend: results.frontend ? '✓ Running' : '✗ Not Running',
    authEndpoints: results.authEndpoints ? '✓ Working' : '✗ Not Working'
  };

  console.log();
  Object.entries(statuses).forEach(([component, status]) => {
    const color = status.startsWith('✓') ? colors.green : colors.red;
    log(`  ${component.padEnd(15)} : ${status}`, color);
  });

  console.log('\n' + '='.repeat(60));

  const allGood = Object.values(results).every(r => r);

  if (allGood) {
    log('\n✓ All systems operational! You can now test login/registration.', colors.green);
    log('\nNext step: Run full tests with:', colors.cyan);
    log('  node test-auth.js', colors.cyan);
  } else {
    log('\n⚠ Some components need attention (see above)', colors.yellow);

    if (!results.database) {
      log('\n1. Start MySQL in XAMPP', colors.yellow);
      log('2. Create database and tables using schema.sql', colors.yellow);
    }
    if (!results.backend) {
      log('\n3. Start backend: cd backend && npm run dev', colors.yellow);
    }
    if (!results.frontend) {
      log('\n4. Start frontend: npm run dev', colors.yellow);
    }
  }

  console.log();
}

runChecks().catch(error => {
  console.error('Check failed:', error);
  process.exit(1);
});
