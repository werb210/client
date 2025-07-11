/**
 * Test API Direct Connection
 * Browser console script to test the direct Express server connection
 */

console.log('🔍 TESTING DIRECT API CONNECTION');
console.log('===============================');

// Test the direct Express server connection
async function testDirectAPI() {
  const endpoints = [
    'http://localhost:5000/api/public/lenders',
    'http://localhost:5000/api/health',
    '/api/public/lenders'  // This should work after the fix
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔗 Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
        console.log(`   📄 Response:`, data);
        if (data.products) {
          console.log(`   📦 Products: ${data.products.length}`);
        }
      } else {
        console.log(`❌ ${endpoint}: FAILED (${response.status})`);
        console.log(`   📄 Error:`, data);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
    console.log('');
  }
}

// Test IndexedDB cache after successful sync
async function testCacheAfterSync() {
  try {
    const { get } = await import('idb-keyval');
    const cache = await get('lender_products_cache');
    console.log('📊 IndexedDB Cache:', cache?.length || 0, 'products');
    return cache;
  } catch (error) {
    console.log('❌ Cache test failed:', error.message);
    return null;
  }
}

// Complete diagnostic workflow
async function runCompleteTest() {
  console.log('🚀 RUNNING COMPLETE API TEST');
  console.log('============================');
  
  await testDirectAPI();
  const cache = await testCacheAfterSync();
  
  if (cache && cache.length >= 41) {
    console.log('🎯 RESULT: ✅ ALL SYSTEMS READY FOR DEPLOYMENT');
  } else {
    console.log('🎯 RESULT: ❌ CACHE NEEDS POPULATION');
  }
}

// Make functions globally available
window.testDirectAPI = testDirectAPI;
window.testCacheAfterSync = testCacheAfterSync;
window.runCompleteTest = runCompleteTest;

console.log('✅ Test functions ready!');
console.log('📍 Run: runCompleteTest() for full diagnostic');
console.log('📍 Run: testDirectAPI() for API tests only');