/**
 * API Connection Test - Identify specific errors when fetching authentic lender products
 * This script tests the staff API connection and reports detailed error information
 */

async function testAPIConnection() {
  console.log('🔍 Testing Staff API Connection...');
  
  const staffApiUrl = 'https://staffportal.replit.app/api';
  const endpoint = `${staffApiUrl}/public/lenders`;
  
  console.log(`📡 Testing endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Client-Portal-Test/1.0'
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error Details:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Status Text: ${response.statusText}`);
      console.error(`   Response Body:`, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
    const contentType = response.headers.get('content-type');
    console.log(`📄 Content Type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error(`❌ Non-JSON Response:`, textResponse);
      return { success: false, error: 'Non-JSON response received' };
    }
    
    const data = await response.json();
    console.log(`✅ JSON Response Structure:`, Object.keys(data));
    
    // Check for different possible data structures
    const products = data.products || data.lenders || data.data || (Array.isArray(data) ? data : null);
    
    if (!products) {
      console.error(`❌ No products found in response:`, data);
      return { success: false, error: 'No products array found in response' };
    }
    
    console.log(`📊 Found ${products.length} products`);
    
    if (products.length > 0) {
      console.log(`📋 Sample product structure:`, Object.keys(products[0]));
      console.log(`📋 First product:`, products[0]);
    }
    
    return { 
      success: true, 
      data: products,
      count: products.length,
      sampleProduct: products[0]
    };
    
  } catch (error) {
    console.error(`❌ Connection Error:`, error);
    return { 
      success: false, 
      error: error.message,
      type: 'connection_error'
    };
  }
}

// Test multiple endpoints
async function comprehensiveAPITest() {
  console.log('🚀 Starting Comprehensive API Test...');
  
  const endpoints = [
    '/public/lenders',
    '/lenders',
    '/products',
    '/api/lenders',
    '/api/products'
  ];
  
  const baseUrl = 'https://staffportal.replit.app/api';
  
  for (const endpoint of endpoints) {
    const fullUrl = endpoint.startsWith('/api/') ? 
      `https://staffportal.replit.app${endpoint}` : 
      `${baseUrl}${endpoint}`;
      
    console.log(`\n🔍 Testing: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        const products = data.products || data.lenders || data.data || (Array.isArray(data) ? data : null);
        console.log(`   ✅ Success: ${products ? products.length : 'No'} products found`);
        
        if (products && products.length > 0) {
          console.log(`   📋 Working endpoint found: ${fullUrl}`);
          return { endpoint: fullUrl, data: products };
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  return null;
}

// Run the tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 STAFF API CONNECTION DIAGNOSTIC');
  console.log('='.repeat(60));
  
  // Test primary endpoint
  const primaryTest = await testAPIConnection();
  
  if (!primaryTest.success) {
    console.log('\n📋 Primary endpoint failed, testing alternatives...');
    const alternativeResult = await comprehensiveAPITest();
    
    if (alternativeResult) {
      console.log(`\n✅ Found working endpoint: ${alternativeResult.endpoint}`);
      console.log(`📊 Products available: ${alternativeResult.data.length}`);
    } else {
      console.log('\n❌ No working endpoints found');
      console.log('\n🔧 Possible Issues:');
      console.log('   1. Staff API server is down');
      console.log('   2. CORS configuration prevents access');
      console.log('   3. Authentication required');
      console.log('   4. Endpoint URLs have changed');
      console.log('   5. Network connectivity issues');
    }
  } else {
    console.log('\n✅ API Connection Successful!');
    console.log(`📊 ${primaryTest.count} authentic lender products available`);
  }
  
  console.log('\n='.repeat(60));
}

// Run the diagnostic
runTests().catch(console.error);