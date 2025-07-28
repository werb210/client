/**
 * STAFF BACKEND ENDPOINT DISCOVERY
 * Find working endpoints for finalization
 */

console.log('🔍 DISCOVERING STAFF BACKEND ENDPOINTS');
console.log('=====================================');

async function discoverStaffEndpoints() {
  const applicationId = 'd105ec01-3553-4392-91b7-621ad3f79bb6';
  const token = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN;
  
  console.log('Testing staff backend endpoints directly...');
  console.log('Application ID:', applicationId);
  
  // Test different HTTP methods and endpoints
  const tests = [
    { method: 'GET', path: `/public/applications/${applicationId}` },
    { method: 'PUT', path: `/public/applications/${applicationId}` },
    { method: 'PATCH', path: `/public/applications/${applicationId}` },
    { method: 'POST', path: `/public/applications/${applicationId}/status` },
    { method: 'POST', path: `/public/applications/submit` },
    { method: 'POST', path: `/public/submit` },
    { method: 'GET', path: `/public/applications` },
    { method: 'GET', path: `/health` },
    { method: 'GET', path: `/status` }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.method} ${test.path}`);
      
      const response = await fetch(`https://staff.boreal.financial/api${test.path}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: test.method !== 'GET' ? JSON.stringify({ test: true, applicationId }) : undefined
      });
      
      const status = `${response.status} ${response.statusText}`;
      console.log(`  Response: ${status}`);
      
      let responseData = '';
      try {
        responseData = await response.text();
        if (responseData.length > 200) responseData = responseData.substring(0, 200) + '...';
      } catch (e) {
        responseData = '[Unable to read response]';
      }
      
      results.push({
        endpoint: `${test.method} ${test.path}`,
        status: response.status,
        statusText: response.statusText,
        working: response.status < 500 && response.status !== 404,
        responsePreview: responseData
      });
      
      if (response.status < 500 && response.status !== 404) {
        console.log(`  ✅ WORKING ENDPOINT: ${test.method} ${test.path}`);
        console.log(`  Response preview: ${responseData.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
      results.push({
        endpoint: `${test.method} ${test.path}`,
        status: 'ERROR',
        statusText: error.message,
        working: false,
        responsePreview: ''
      });
    }
  }
  
  console.log('\n📊 ENDPOINT DISCOVERY RESULTS:');
  console.log('==============================');
  
  const workingEndpoints = results.filter(r => r.working);
  const notFoundEndpoints = results.filter(r => r.status === 404);
  const errorEndpoints = results.filter(r => !r.working && r.status !== 404);
  
  console.log(`✅ Working endpoints: ${workingEndpoints.length}`);
  workingEndpoints.forEach(e => console.log(`   ${e.endpoint} → ${e.status}`));
  
  console.log(`⚠️ Not found endpoints: ${notFoundEndpoints.length}`);
  notFoundEndpoints.forEach(e => console.log(`   ${e.endpoint} → ${e.status}`));
  
  console.log(`❌ Error endpoints: ${errorEndpoints.length}`);
  errorEndpoints.forEach(e => console.log(`   ${e.endpoint} → ${e.status}`));
  
  return { workingEndpoints, notFoundEndpoints, errorEndpoints };
}

// Run discovery
discoverStaffEndpoints().then(results => {
  console.log('\n🎯 NEXT STEPS:');
  
  if (results.workingEndpoints.length > 0) {
    console.log('✅ Found working endpoints - can implement fallback finalization');
    console.log('💡 Will create server-side fallback using working endpoints');
  } else {
    console.log('⚠️ No working endpoints found - staff backend may need configuration');
    console.log('💡 Will implement client-side completion tracking as fallback');
  }
});

window.discoverStaffEndpoints = discoverStaffEndpoints;