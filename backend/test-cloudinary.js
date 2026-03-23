// Direct Cloudinary API Test
// Run: node backend/test-cloudinary.js

require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

console.log('\n🔧 Testing Cloudinary Configuration...\n');

// Check environment variables
console.log('1️⃣ Checking Environment Variables:');
console.log('   CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING');
console.log('   CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('   CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test API connection
async function testConnection() {
  try {
    console.log('\n2️⃣ Testing Cloudinary API Connection...');

    const result = await cloudinary.api.ping();

    if (result.status === 'ok') {
      console.log('   ✅ Cloudinary API is working!');
      console.log('   Status:', result.status);
      return true;
    }
  } catch (error) {
    console.log('   ❌ Cloudinary API Error:');
    console.log('   Error:', error.message);
    console.log('   Status:', error.http_code);
    return false;
  }
}

// Test listing resources
async function testListing() {
  try {
    console.log('\n3️⃣ Testing List Resources...');

    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'placement-system/resumes',
      max_results: 5
    });

    console.log('   ✅ Successfully listed resources!');
    console.log('   Total resources found:', result.resources.length);

    if (result.resources.length > 0) {
      console.log('   Recent uploads:');
      result.resources.forEach((resource, i) => {
        console.log(`     ${i + 1}. ${resource.public_id}`);
        console.log(`        URL: ${resource.secure_url}`);
      });
    } else {
      console.log('   ⚠️  No files found in placement-system/resumes folder');
    }

    return true;
  } catch (error) {
    console.log('   ❌ Error listing resources:');
    console.log('   Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  const connected = await testConnection();

  if (connected) {
    await testListing();
    console.log('\n✅ Cloudinary is properly configured!\n');
  } else {
    console.log('\n❌ Cannot connect to Cloudinary. Check credentials!\n');
    console.log('Debug info:');
    console.log('  CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('  API_KEY:', process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...');
    console.log('  API_SECRET:', process.env.CLOUDINARY_API_SECRET?.substring(0, 5) + '...');
  }
}

runTests();
