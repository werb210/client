/**
 * Staff API Connectivity Diagnostic
 * Tests the actual staff backend API endpoints to diagnose connectivity issues
 */

async function testStaffAPIConnectivity() {
  console.log('🔍 Diagnosing Staff API Connectivity Issues');
  console.log('='.repeat(80));
  
  const endpoints = [
    'https://staffportal.replit.app/api/public/lenders',
    'https://staffportal.replit.app/api/health',
    'https://staffportal.replit.app/api',
    'https://staffportal.replit.app/'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Boreal-Client/1.0'
        },
        timeout: 10000
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
          } catch (parseError) {
            console.log(`   ❌ JSON Parse Error: ${parseError.message}`);
          }
        } else {
          const text = await response.text();
          console.log(`   Response: ${text.substring(0, 200)}...`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error Response: ${errorText.substring(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
  
  // Test alternative API configurations
  console.log('\n🔧 Testing Alternative Configurations...');
  
  const alternativeEndpoints = [
    'https://staff.borealfinance.app/api/public/lenders',
    'https://staffportal.replit.app/api/v1/lenders',
    'https://staffportal.replit.app/lenders'
  ];
  
  for (const endpoint of alternativeEndpoints) {
    console.log(`\n🔗 Alternative: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        console.log(`   ✅ Alternative endpoint working!`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${error.message}`);
    }
  }
  
  console.log('\n📊 Diagnosis Complete');
  console.log('If all endpoints are failing, the staff backend may be temporarily unavailable.');
  console.log('Consider implementing a robust caching system or requesting updated API credentials.');
}

// Execute diagnostic
testStaffAPIConnectivity();