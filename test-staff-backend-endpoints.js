/**
 * STAFF BACKEND ENDPOINTS TEST
 * Testing which finalization endpoint exists on staff backend
 */

console.log('🔍 TESTING STAFF BACKEND FINALIZATION ENDPOINTS');
console.log('==============================================');

async function testFinalizationEndpoints() {
  const applicationId = '23c5dd3c-5688-4c3c-9791-3867a191b662';
  const testPayload = { test: true };
  
  // Test different possible endpoints
  const endpoints = [
    { method: 'PATCH', path: `/api/public/applications/${applicationId}/finalize` },
    { method: 'POST', path: `/api/public/applications/${applicationId}/finalize` },
    { method: 'PUT', path: `/api/public/applications/${applicationId}/finalize` },
    { method: 'PATCH', path: `/api/public/applications/${applicationId}` },
    { method: 'POST', path: `/api/public/applications/${applicationId}/submit` }
  ];
  
  console.log('Testing staff backend endpoints directly...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}`);
      
      const response = await fetch(`https://staff.boreal.financial${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log('  ❌ Endpoint not found');
      } else if (response.status === 405) {
        console.log('  ⚠️ Method not allowed (endpoint exists but wrong method)');
      } else if (response.status < 500) {
        console.log('  ✅ Endpoint exists!');
        const responseText = await response.text();
        console.log('  Response:', responseText.substring(0, 200));
      } else {
        console.log('  ⚠️ Server error (endpoint may exist)');
      }
      
    } catch (error) {
      console.log(`  ❌ Request failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🔍 CHECKING STAFF BACKEND API DOCUMENTATION');
  console.log('==========================================');
  
  try {
    const docsResponse = await fetch('https://staff.boreal.financial/api/docs', {
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}` }
    });
    
    if (docsResponse.ok) {
      console.log('✅ API documentation available');
    } else {
      console.log('⚠️ No API documentation found');
    }
  } catch (error) {
    console.log('❌ Cannot access API docs');
  }
}

testFinalizationEndpoints();
window.testFinalizationEndpoints = testFinalizationEndpoints;