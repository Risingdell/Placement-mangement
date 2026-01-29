/**
 * Authentication Testing Script
 *
 * This script tests the registration and login endpoints
 * Run with: node test-auth.js
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  usn: 'TEST123CS001',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
  phone: '1234567890',
  branch: 'Computer Science',
  batchYear: 2021
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.blue);
  console.log('='.repeat(60));
}

async function testServerHealth() {
  logSection('Testing Server Health');

  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();

    if (response.ok) {
      log('✓ Server is running', colors.green);
      console.log('  Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      log('✗ Server responded with error', colors.red);
      console.log('  Response:', JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    log('✗ Server is not reachable', colors.red);
    console.log('  Error:', error.message);
    console.log('\n  Make sure the backend server is running:');
    console.log('  cd backend && npm run dev');
    return false;
  }
}

async function testRegistration() {
  logSection('Testing Registration');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();

    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      log('✓ Registration successful', colors.green);
      return true;
    } else if (response.status === 400 && data.message?.includes('already exists')) {
      log('✓ Registration endpoint working (user already exists)', colors.yellow);
      return true; // User exists is OK for testing
    } else {
      log('✗ Registration failed', colors.red);
      return false;
    }
  } catch (error) {
    log('✗ Registration request failed', colors.red);
    console.log('Error:', error.message);
    return false;
  }
}

async function testLogin() {
  logSection('Testing Login');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();

    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok && data.token) {
      log('✓ Login successful', colors.green);
      console.log('\n  Token received:', data.token.substring(0, 20) + '...');

      // Test the token
      await testProtectedRoute(data.token);
      return true;
    } else {
      log('✗ Login failed', colors.red);
      return false;
    }
  } catch (error) {
    log('✗ Login request failed', colors.red);
    console.log('Error:', error.message);
    return false;
  }
}

async function testProtectedRoute(token) {
  logSection('Testing Protected Route (/api/auth/me)');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      log('✓ Protected route accessible with valid token', colors.green);
      return true;
    } else {
      log('✗ Protected route failed', colors.red);
      return false;
    }
  } catch (error) {
    log('✗ Protected route request failed', colors.red);
    console.log('Error:', error.message);
    return false;
  }
}

async function testInvalidLogin() {
  logSection('Testing Invalid Login Credentials');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });

    const data = await response.json();

    console.log('Status Code:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      log('✓ Invalid credentials properly rejected', colors.green);
      return true;
    } else {
      log('✗ Invalid credentials not properly handled', colors.red);
      return false;
    }
  } catch (error) {
    log('✗ Invalid login test failed', colors.red);
    console.log('Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.clear();
  log('\n╔══════════════════════════════════════════════════════════╗', colors.blue);
  log('║     PLACEMENT MANAGEMENT SYSTEM - AUTH TESTING          ║', colors.blue);
  log('╚══════════════════════════════════════════════════════════╝', colors.blue);

  const results = {
    serverHealth: false,
    registration: false,
    login: false,
    invalidLogin: false
  };

  // Test server health first
  results.serverHealth = await testServerHealth();

  if (!results.serverHealth) {
    logSection('Test Summary');
    log('Cannot proceed with tests - server is not running', colors.red);
    return;
  }

  // Run other tests
  results.registration = await testRegistration();
  results.login = await testLogin();
  results.invalidLogin = await testInvalidLogin();

  // Summary
  logSection('Test Summary');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  console.log(`\n  Tests Passed: ${passed}/${total}\n`);

  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✓' : '✗';
    const color = result ? colors.green : colors.red;
    log(`  ${icon} ${test}`, color);
  });

  console.log('\n' + '='.repeat(60) + '\n');

  if (passed === total) {
    log('All tests passed! ✓', colors.green);
  } else {
    log('Some tests failed. Check the output above for details.', colors.yellow);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
