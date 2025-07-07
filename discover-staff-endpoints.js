/**
 * Staff API Endpoint Discovery
 * Find what endpoints are actually available on the staff backend
 */

async function discoverStaffEndpoints() {
  console.log('🔍 DISCOVERING STAFF API ENDPOINTS');
  console.log('=' .repeat(50));
  
  const baseUrls = [
    'https://staffportal.replit.app',
    'https://staffportal.replit.app/api',
    'https://staff.borealfinance.app',
    'https://staff.borealfinance.app/api'
  ];
  
  for (const baseUrl of baseUrls) {
    console.log(`\n🌐 Testing base URL: ${baseUrl}`);
    
    try {
      const response = await fetch(baseUrl);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`   Content-Type: ${contentType}`);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   ✅ JSON Response:`, Object.keys(data));
        } else {
          const text = await response.text();
          if (text.includes('<!DOCTYPE html')) {
            console.log(`   📄 HTML Page (length: ${text.length})`);
            
            // Look for API documentation or endpoint hints
            const apiHints = text.match(/\/api\/[a-zA-Z0-9\-\/]+/g) || [];
            if (apiHints.length > 0) {
              console.log(`   🔗 Found API paths:`, [...new Set(apiHints)]);
            }
          } else {
            console.log(`   📝 Text Response:`, text.substring(0, 200));
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
  }
  
  // Test common API endpoints
  const commonEndpoints = [
    '/health',
    '/status', 
    '/ping',
    '/api',
    '/api/health',
    '/api/status',
    '/api/lenders',
    '/api/products',
    '/api/public',
    '/api/public/lenders',
    '/api/public/products',
    '/lenders',
    '/products',
    '/public/lenders',
    '/public/products'
  ];
  
  console.log(`\n🔍 Testing common endpoints on https://staffportal.replit.app...`);
  
  for (const endpoint of commonEndpoints) {
    const url = `https://staffportal.replit.app${endpoint}`;
    
    try {
      const response = await fetch(url);
      if (response.status !== 404) {
        console.log(`   ✅ ${endpoint} → ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`      📊 JSON keys:`, Object.keys(data));
            
            // Check if this looks like lender data
            const possibleData = data.products || data.lenders || data.data || (Array.isArray(data) ? data : null);
            if (possibleData && possibleData.length > 0) {
              console.log(`      🎯 FOUND LENDER DATA: ${possibleData.length} items`);
              console.log(`      📋 Sample item:`, Object.keys(possibleData[0]));
            }
          }
        }
      }
    } catch (error) {
      // Ignore connection errors for endpoint discovery
    }
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run discovery
discoverStaffEndpoints().catch(console.error);