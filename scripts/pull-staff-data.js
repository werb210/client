/**
 * Script to pull lender product data from staff API
 * Tests multiple endpoints to find the correct one
 */

const endpoints = [
  'https://staffportal.replit.app/api/public/lenders',
  'https://staffportal.replit.app/api/lenders',
  'https://staffportal.replit.app/api/products',
  'https://staffportal.replit.app/api/public/products',
  'https://staff.boreal.financial/api/public/lenders',
  'https://staff.boreal.financial/api/lenders'
];

async function testEndpoint(url) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS! Data structure:`, Object.keys(data));
      if (data.products && Array.isArray(data.products)) {
        console.log(`📊 Found ${data.products.length} products`);
        console.log(`🏢 Sample product:`, data.products[0]);
      } else if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} products`);
        console.log(`🏢 Sample product:`, data[0]);
      }
      return { url, data, success: true };
    } else {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return { url, error: errorText, success: false };
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return { url, error: error.message, success: false };
  }
}

async function pullStaffData() {
  console.log('🚀 Starting staff API data pull...');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`\n✅ FOUND WORKING ENDPOINT: ${result.url}`);
      console.log(`📝 Saving data to fallback file...`);
      
      // Save to fallback file
      const fallbackData = {
        success: true,
        products: result.data.products || result.data,
        count: (result.data.products || result.data).length,
        source: result.url,
        timestamp: new Date().toISOString()
      };
      
      console.log(`💾 Fallback data prepared with ${fallbackData.count} products`);
      console.log(`🔗 Source: ${fallbackData.source}`);
      return fallbackData;
    }
  }
  
  console.log('\n❌ No working endpoints found');
  return null;
}

// Run the script
pullStaffData().then(result => {
  if (result) {
    console.log('\n🎉 Data pull complete!');
    console.log('📊 Summary:', {
      products: result.count,
      source: result.source,
      timestamp: result.timestamp
    });
  } else {
    console.log('\n💔 Data pull failed - no working endpoints');
  }
}).catch(error => {
  console.error('💥 Script error:', error);
});