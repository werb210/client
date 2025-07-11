/**
 * CLIENT VERIFICATION DIAGNOSTIC
 * Tests IndexedDB caching, sync behavior, and Step 2/5 access patterns
 * Run this in browser console on the client application
 */

// Test 1: Verify Cached Product Retrieval
async function test1_VerifyCache() {
  console.log('🔍 TEST 1: Verify Cached Product Retrieval');
  
  try {
    // Import idb-keyval
    const { get } = await import('idb-keyval');
    
    const data = await get('lender_products_cache');
    console.log('🗂️ Cached lender products:', data?.length || 0, 'products');
    
    if (data && data.length > 0) {
      console.log('✅ Sample products:', data.slice(0, 2));
      console.log('✅ Expected: At least 41 products -', data.length >= 41 ? 'PASS' : 'FAIL');
    } else {
      console.log('❌ Cache is empty or undefined - sync failed');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
    return null;
  }
}

// Test 2: Trigger Sync and Show Logs  
async function test2_TriggerSync() {
  console.log('🔄 TEST 2: Trigger Sync and Show Logs');
  
  try {
    // Try to import and run sync
    const response = await fetch('/api/public/lenders');
    
    if (!response.ok) {
      console.log('❌ Staff API not available:', response.status, response.statusText);
      const errorData = await response.json();
      console.log('❌ Error details:', errorData);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Staff API response:', data);
    
    if (data.success && data.products) {
      console.log('✅ Fetched', data.products.length, 'products from staff API');
      
      // Try to save to IndexedDB
      const { set } = await import('idb-keyval');
      await set('lender_products_cache', data.products);
      console.log('✅ Saved to IndexedDB');
      
      return true;
    } else {
      console.log('❌ Invalid API response format');
      return false;
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
    return false;
  }
}

// Test 3: Step 2 Logic Test
async function test3_Step2Logic() {
  console.log('📦 TEST 3: Step 2 Logic Test - Category Selection');
  
  try {
    // Get cached products
    const { get } = await import('idb-keyval');
    const cachedProducts = await get('lender_products_cache');
    
    if (!cachedProducts || cachedProducts.length === 0) {
      console.log('❌ No cached products available for Step 2 test');
      return false;
    }
    
    // Filter for factoring products
    const category = 'Invoice Factoring';
    const businessLocation = 'CA';
    const fundingAmount = 200000;
    
    const filteredProducts = cachedProducts.filter(product => {
      const categoryMatch = product.category === category || 
                          product.category === 'Factoring' ||
                          product.category === 'invoice_factoring';
      
      const locationMatch = product.country === businessLocation || 
                           product.country === 'CA' ||
                           product.offeredInCanada === true;
      
      const amountMatch = product.minAmountUsd <= fundingAmount && 
                         product.maxAmountUsd >= fundingAmount;
      
      return categoryMatch && locationMatch && amountMatch;
    });
    
    console.log('📦 Recommended Products for', category, ':', filteredProducts.length);
    console.log('✅ Sample products:', filteredProducts.slice(0, 2));
    console.log('✅ Expected: Non-empty array -', filteredProducts.length > 0 ? 'PASS' : 'FAIL');
    
    return filteredProducts.length > 0;
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
    return false;
  }
}

// Test 4: Step 5 Logic Test  
async function test4_Step5Logic() {
  console.log('📄 TEST 4: Step 5 Logic Test - Document Deduplication');
  
  try {
    // Get cached products for factoring
    const { get } = await import('idb-keyval');
    const cachedProducts = await get('lender_products_cache');
    
    if (!cachedProducts || cachedProducts.length === 0) {
      console.log('❌ No cached products available for Step 5 test');
      return false;
    }
    
    // Filter factoring products
    const factoringProducts = cachedProducts.filter(product => 
      product.category === 'Invoice Factoring' || 
      product.category === 'Factoring' ||
      product.category === 'invoice_factoring'
    );
    
    console.log('📄 Factoring products found:', factoringProducts.length);
    
    // Extract and deduplicate documents
    const allDocuments = new Set();
    factoringProducts.forEach(product => {
      if (product.requiredDocuments && Array.isArray(product.requiredDocuments)) {
        product.requiredDocuments.forEach(doc => allDocuments.add(doc));
      }
    });
    
    const deduplicatedDocs = Array.from(allDocuments);
    console.log('📄 Required Documents (deduplicated):', deduplicatedDocs.length);
    console.log('✅ Document list:', deduplicatedDocs);
    console.log('✅ Expected: Deduplicated document list -', deduplicatedDocs.length > 0 ? 'PASS' : 'FAIL');
    
    return deduplicatedDocs.length > 0;
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 STARTING CLIENT VERIFICATION DIAGNOSTIC');
  console.log('='.repeat(50));
  
  const results = {
    test1: await test1_VerifyCache(),
    test2: await test2_TriggerSync(), 
    test3: await test3_Step2Logic(),
    test4: await test4_Step5Logic()
  };
  
  console.log('='.repeat(50));
  console.log('📊 DIAGNOSTIC RESULTS:');
  console.log('✅ Test 1 - Cache Verification:', results.test1 ? 'PASS' : 'FAIL');
  console.log('✅ Test 2 - Sync Trigger:', results.test2 ? 'PASS' : 'FAIL');
  console.log('✅ Test 3 - Step 2 Logic:', results.test3 ? 'PASS' : 'FAIL');
  console.log('✅ Test 4 - Step 5 Logic:', results.test4 ? 'PASS' : 'FAIL');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Client application ready!');
  } else {
    console.log('⚠️ SOME TESTS FAILED - Check staff API endpoint implementation');
  }
  
  return results;
}

// Export for console use
window.runClientVerification = runAllTests;
window.test1_VerifyCache = test1_VerifyCache;
window.test2_TriggerSync = test2_TriggerSync;
window.test3_Step2Logic = test3_Step2Logic;
window.test4_Step5Logic = test4_Step5Logic;

console.log('🔧 CLIENT VERIFICATION DIAGNOSTIC LOADED');
console.log('Run: runClientVerification() to execute all tests');
console.log('Or run individual tests: test1_VerifyCache(), test2_TriggerSync(), etc.');