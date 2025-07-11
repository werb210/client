/**
 * BROWSER CONSOLE TEST SCRIPT
 * Copy and paste this into browser console on the diagnostic page
 */

console.log('🚀 STARTING CLIENT VERIFICATION TESTS');
console.log('=====================================');

// Test 1: Check IndexedDB Cache
async function testIndexedDBCache() {
  console.log('🔍 Test 1: IndexedDB Cache Verification');
  try {
    // Try to import idb-keyval
    const { get } = await import('idb-keyval');
    const data = await get('lender_products_cache');
    
    console.log('🗂️ Cached products:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('✅ Sample products:', data.slice(0, 2));
      console.log('✅ Cache status:', data.length >= 41 ? 'PASS (≥41 products)' : `FAIL (${data.length} < 41)`);
    } else {
      console.log('❌ Cache is empty - sync has not occurred');
    }
    return data;
  } catch (error) {
    console.error('❌ Cache test failed:', error);
    return null;
  }
}

// Test 2: API Endpoint Test
async function testAPIEndpoint() {
  console.log('🔗 Test 2: API Endpoint Verification');
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('📡 API Status:', response.status, response.statusText);
    console.log('📄 API Response:', data);
    
    if (response.ok && data.success && data.products) {
      console.log('✅ API test: PASS');
      return data.products;
    } else {
      console.log('❌ API test: FAIL - endpoint not working');
      return null;
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
    return null;
  }
}

// Test 3: Manual Sync Attempt
async function testManualSync() {
  console.log('🔄 Test 3: Manual Sync Attempt');
  try {
    const apiData = await testAPIEndpoint();
    if (apiData) {
      const { set } = await import('idb-keyval');
      await set('lender_products_cache', apiData);
      console.log('✅ Manual sync: PASS - saved to IndexedDB');
      return true;
    } else {
      console.log('❌ Manual sync: FAIL - no API data to sync');
      return false;
    }
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    return false;
  }
}

// Test 4: Step 2/5 Logic Simulation
async function testStepLogic() {
  console.log('📦 Test 4: Step 2/5 Logic Simulation');
  try {
    const { get } = await import('idb-keyval');
    const products = await get('lender_products_cache');
    
    if (!products || products.length === 0) {
      console.log('❌ No products available for logic test');
      return false;
    }
    
    // Simulate Step 2 filtering
    const factoringProducts = products.filter(p => 
      p.category === 'Invoice Factoring' || 
      p.category === 'Factoring' ||
      p.category === 'invoice_factoring'
    );
    
    console.log('📊 Step 2 - Factoring products found:', factoringProducts.length);
    
    // Simulate Step 5 document deduplication
    const allDocs = new Set();
    factoringProducts.forEach(product => {
      if (product.requiredDocuments && Array.isArray(product.requiredDocuments)) {
        product.requiredDocuments.forEach(doc => allDocs.add(doc));
      }
    });
    
    const uniqueDocs = Array.from(allDocs);
    console.log('📄 Step 5 - Unique documents:', uniqueDocs.length, uniqueDocs);
    
    console.log('✅ Step logic test:', uniqueDocs.length > 0 ? 'PASS' : 'FAIL');
    return uniqueDocs.length > 0;
    
  } catch (error) {
    console.error('❌ Step logic test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🎯 RUNNING ALL VERIFICATION TESTS');
  console.log('==================================');
  
  const results = {
    cache: await testIndexedDBCache(),
    api: await testAPIEndpoint(),
    sync: await testManualSync(),
    logic: await testStepLogic()
  };
  
  console.log('🎯 FINAL TEST RESULTS:');
  console.log('======================');
  console.log('Cache Test:', results.cache ? 'PASS' : 'FAIL');
  console.log('API Test:', results.api ? 'PASS' : 'FAIL');
  console.log('Sync Test:', results.sync ? 'PASS' : 'FAIL'); 
  console.log('Logic Test:', results.logic ? 'PASS' : 'FAIL');
  
  return results;
}

// Make functions available globally
window.testIndexedDBCache = testIndexedDBCache;
window.testAPIEndpoint = testAPIEndpoint;
window.testManualSync = testManualSync;
window.testStepLogic = testStepLogic;
window.runAllTests = runAllTests;

console.log('✅ Test functions loaded! Run: runAllTests()');
