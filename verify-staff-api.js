/**
 * Verify Staff API Response
 * Direct test to confirm current status of lender products endpoint
 */

console.log('🔍 Verifying staff API endpoint status...');
console.log('📡 Endpoint: https://staffportal.replit.app/api/public/lenders');
console.log('⏰ Test time:', new Date().toISOString());

fetch('https://staffportal.replit.app/api/public/lenders', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  cache: 'no-store'
})
.then(response => {
  console.log('📊 Response Status:', response.status);
  console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));
  return response.json();
})
.then(data => {
  console.log('📦 Full Response:', data);
  console.log('');
  
  if (data.success && Array.isArray(data.products)) {
    if (data.products.length > 0) {
      console.log('🎉 SUCCESS: Found', data.products.length, 'products in staff database');
      console.log('🔢 Expected count: 41 products');
      console.log('📋 First product sample:', data.products[0]);
      
      if (data.products.length === 41) {
        console.log('✅ SYNC OK - Database contains expected 41 products');
      } else {
        console.log('⚠️ Product count mismatch:', data.products.length, 'vs expected 41');
      }
    } else {
      console.log('❌ EMPTY DATABASE: products array is empty');
      console.log('💡 Staff push may not have completed or endpoint needs refresh');
    }
  } else {
    console.log('❌ INVALID RESPONSE: Missing success field or products array');
  }
})
.catch(error => {
  console.error('❌ API ERROR:', error);
});