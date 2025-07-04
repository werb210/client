/**
 * Debug API Response
 * Examine the exact response structure from staff API
 */

async function debugAPIResponse() {
  console.log('🔍 Debugging Staff API Response Structure');
  console.log('='.repeat(60));
  
  const endpoints = [
    'https://staffportal.replit.app/api/public/lenders',
    'https://staffportal.replit.app/api/lenders',
    'https://staffportal.replit.app/api/products'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer CLIENT_APP_SHARED_TOKEN'
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response Structure:`, JSON.stringify(data, null, 2));
        
        if (data.products && data.products.length > 0) {
          console.log(`   ✅ Found ${data.products.length} products!`);
          console.log(`   Sample product:`, JSON.stringify(data.products[0], null, 2));
          return { endpoint, data };
        }
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`   Network Error: ${error.message}`);
    }
  }
  
  // Test with different authentication
  console.log('\n🔐 Testing with different authentication...');
  
  try {
    const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Boreal-Client/1.0',
        'X-Client-Source': 'boreal-financial-client',
        'X-API-Version': '1.0'
      },
      credentials: 'include'
    });
    
    console.log(`   Status with credentials: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Response with credentials:`, JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log(`   Credentials test failed: ${error.message}`);
  }
}

debugAPIResponse();