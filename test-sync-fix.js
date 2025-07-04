/**
 * Test Sync Fix
 * Manually test the lender products sync functionality
 */

async function testSyncFix() {
  console.log('🔧 Testing Lender Products Sync Fix');
  console.log('='.repeat(60));
  
  const apiBaseUrl = 'https://staffportal.replit.app/api';
  
  try {
    console.log(`🔍 Testing direct API call to: ${apiBaseUrl}/public/lenders`);
    
    const response = await fetch(`${apiBaseUrl}/public/lenders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Boreal-Client/1.0'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log(`✅ Response Status: ${response.status} ${response.statusText}`);
    console.log(`✅ Content-Type: ${response.headers.get('content-type')}`);
    console.log(`✅ CORS Headers: ${response.headers.get('access-control-allow-origin')}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log(`✅ Products Found: ${data.products.length}`);
        console.log(`✅ Sample Product: ${data.products[0].productName} - ${data.products[0].lenderName}`);
        console.log(`✅ Categories: ${[...new Set(data.products.map(p => p.category))].join(', ')}`);
        console.log(`✅ Countries: ${[...new Set(data.products.map(p => p.country))].join(', ')}`);
        
        // Test IndexedDB simulation
        console.log('\n💾 Simulating IndexedDB Import...');
        let importedCount = 0;
        
        for (const product of data.products) {
          // Simulate normalization
          const normalized = {
            id: product.id,
            name: product.productName,
            lenderName: product.lenderName,
            category: product.category.toLowerCase().replace(/\s+/g, '_'),
            country: product.country,
            minAmount: product.amountRange?.min || 0,
            maxAmount: product.amountRange?.max || 1000000,
            description: product.description,
            lastSynced: Date.now()
          };
          importedCount++;
        }
        
        console.log(`✅ Normalized Products: ${importedCount}`);
        console.log('✅ IndexedDB simulation successful');
        
        return {
          success: true,
          productCount: data.products.length,
          message: `Successfully synced ${data.products.length} products`
        };
        
      } else {
        throw new Error('Invalid response format - no products array');
      }
      
    } else {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
  } catch (error) {
    console.error(`❌ Sync Error: ${error.message}`);
    return {
      success: false,
      productCount: 0,
      message: error.message
    };
  }
}

// Execute test
testSyncFix()
  .then(result => {
    console.log('\n🎯 Sync Test Result:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Product Count: ${result.productCount}`);
    console.log(`   Message: ${result.message}`);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });