/**
 * API Configuration Debug Script
 * Run this in browser console to check current API configuration
 */

console.log('🔍 API CONFIGURATION DEBUG');
console.log('=========================');

// Check environment variables
console.log('📊 Environment Variables:');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('Dev:', import.meta.env.DEV);
console.log('Prod:', import.meta.env.PROD);

// Test different API endpoints
async function testEndpoints() {
  const endpoints = [
    '/api/public/lenders',
    'http://localhost:5000/api/public/lenders',
    'https://staffportal.replit.app/api/public/lenders',
    'https://staff.boreal.financial/api/public/lenders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔗 Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log(`✅ ${endpoint}: ${response.status} - ${data.success ? 'SUCCESS' : 'FAILED'}`);
      if (data.products) {
        console.log(`   📦 Products: ${data.products.length}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

// Make functions available globally
window.testEndpoints = testEndpoints;
console.log('✅ Run: testEndpoints() to test all endpoints');