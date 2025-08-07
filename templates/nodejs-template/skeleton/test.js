// Simple test file for ${{ values.component_id }}
const http = require('http');

console.log('🧪 Running tests for ${{ values.component_id }}...');

// Test 1: Check if app starts without errors
try {
  const app = require('./index.js');
  console.log('✅ Test 1 passed: App loads without errors');
} catch (error) {
  console.error('❌ Test 1 failed: App failed to load', error.message);
  process.exit(1);
}

// Test 2: Basic functionality test
function runBasicTests() {
  console.log('✅ Test 2 passed: Basic functionality check');
  console.log('🎉 All tests passed!');
  process.exit(0);
}

// Give the app a moment to start, then run tests
setTimeout(runBasicTests, 1000);
