/**
 * IndexedDB Cache Test Script
 * Tests the lender products cache and sync system
 */

const { chromium } = require('playwright');

async function testIndexedDBCache() {
  console.log('🔍 Starting IndexedDB Cache Test...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the diagnostic page
    console.log('📍 Navigating to diagnostic page...');
    await page.goto('http://localhost:5000/client-verification-diagnostic');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Test cache verification
    console.log('🗂️ Testing cache verification...');
    const cacheResult = await page.evaluate(async () => {
      if (typeof window.idb === 'undefined') {
        // Import idb-keyval if not available
        const { get } = await import('idb-keyval');
        const data = await get('lender_products_cache');
        return {
          success: true,
          count: data?.length || 0,
          hasData: !!data,
          sampleData: data?.slice(0, 2) || []
        };
      }
      return { success: false, error: 'idb-keyval not available' };
    });
    
    console.log('📊 Cache Results:', JSON.stringify(cacheResult, null, 2));
    
    // Test API endpoint
    console.log('🔗 Testing API endpoint...');
    const apiResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/public/lenders');
        const data = await response.json();
        return {
          success: response.ok,
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('🌐 API Results:', JSON.stringify(apiResult, null, 2));
    
    return {
      cache: cacheResult,
      api: apiResult
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the test
testIndexedDBCache().then(results => {
  console.log('🎯 Final Results:', JSON.stringify(results, null, 2));
  process.exit(0);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
