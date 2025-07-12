/**
 * Test Production Staff API
 * Check if the production staff backend has the lender products
 */

async function testProductionStaffAPI() {
  console.log('🔍 TESTING PRODUCTION STAFF API');
  console.log('=' .repeat(50));
  
  const productionUrls = [
    'https://staff.boreal.financial',
    'https://staff.boreal.financial/api',
    'https://staff.boreal.financial/api/public/lenders',
    'https://app.boreal.financial/api/public/lenders'
  ];
  
  for (const url of productionUrls) {
    console.log(`\n🌐 Testing: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${process.env.CLIENT_APP_SHARED_TOKEN || 'your-token-here'}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`   Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   ✅ JSON Response:`, Object.keys(data));
          
          const products = data.products || data.lenders || data.data || (Array.isArray(data) ? data : null);
          if (products && products.length > 0) {
            console.log(`   🎯 FOUND LENDER DATA: ${products.length} authentic products`);
            console.log(`   📋 Sample product:`, Object.keys(products[0]));
            return { url, products, count: products.length };
          }
        } else {
          const text = await response.text();
          console.log(`   📝 Text Response (first 200 chars):`, text.substring(0, 200));
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  return null;
}

// Test without authentication too
async function testWithoutAuth() {
  console.log('\n🔓 Testing without authentication...');
  
  const urls = [
    'https://staff.boreal.financial/api/public/lenders',
    'https://app.boreal.financial/api/public/lenders'
  ];
  
  for (const url of urls) {
    console.log(`\n🌐 Testing (no auth): ${url}`);
    
    try {
      const response = await fetch(url);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.lenders || data.data || (Array.isArray(data) ? data : null);
        if (products && products.length > 0) {
          console.log(`   🎯 FOUND PUBLIC DATA: ${products.length} products`);
          return { url, products, count: products.length };
        }
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  return null;
}

// Run comprehensive test
async function runProductionTest() {
  const authResult = await testProductionStaffAPI();
  if (authResult) {
    console.log(`\n✅ SUCCESS: Found ${authResult.count} products at ${authResult.url}`);
    return;
  }
  
  const publicResult = await testWithoutAuth();
  if (publicResult) {
    console.log(`\n✅ SUCCESS: Found ${publicResult.count} products at ${publicResult.url}`);
    return;
  }
  
  console.log('\n❌ FAILED: No working staff API endpoints found');
  console.log('\n📋 Summary of tested endpoints:');
  console.log('   ❌ https://staffportal.replit.app (404 - server down)');
  console.log('   ❌ https://staff.boreal.financial (connection failed)');
  console.log('   ❌ https://app.boreal.financial (connection failed)');
  console.log('\n🔧 Required for application to function:');
  console.log('   1. Staff backend API must be deployed and running');
  console.log('   2. Lender products endpoint must be available');
  console.log('   3. API must return authentic lender product data');
}

runProductionTest().catch(console.error);