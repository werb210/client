/**
 * API Status Validation Script
 * Run this in browser console to test current API configuration
 */

console.log('🔍 API STATUS VALIDATION TEST');
console.log('============================');

// Test the same endpoint the user tested
async function testDirectStaffAPI() {
  console.log('\n📡 Testing Direct Staff API Access');
  
  try {
    const response = await fetch("https://staff.boreal.financial/api/public/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dev-bypass": "true",
      },
      body: JSON.stringify({ test: "client-direct-validation" }),
    });
    
    const text = await response.text();
    console.log("[DIRECT API TEST] Status:", response.status, response.statusText);
    console.log("[DIRECT API TEST] Body:", text);
    console.log("[DIRECT API TEST] Headers:", Object.fromEntries(response.headers.entries()));
    
    return { status: response.status, body: text, ok: response.ok };
    
  } catch (error) {
    console.error("[DIRECT API TEST] Error:", error);
    return { error: error.message };
  }
}

// Test through local proxy (how the app actually works)
async function testProxyAPI() {
  console.log('\n🔄 Testing Through Local Proxy');
  
  try {
    const response = await fetch("/api/public/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
      },
      body: JSON.stringify({ test: "proxy-validation" }),
    });
    
    const text = await response.text();
    console.log("[PROXY API TEST] Status:", response.status, response.statusText);
    console.log("[PROXY API TEST] Body:", text);
    console.log("[PROXY API TEST] URL:", response.url);
    
    return { status: response.status, body: text, ok: response.ok };
    
  } catch (error) {
    console.error("[PROXY API TEST] Error:", error);
    return { error: error.message };
  }
}

// Check environment configuration
function checkEnvironment() {
  console.log('\n🔧 Environment Configuration');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('VITE_CLIENT_APP_SHARED_TOKEN available:', !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN);
  console.log('Current origin:', window.location.origin);
  console.log('Expected staff API:', 'https://staff.boreal.financial/api');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive API validation...\n');
  
  checkEnvironment();
  
  const directResult = await testDirectStaffAPI();
  const proxyResult = await testProxyAPI();
  
  console.log('\n📊 Test Results Summary:');
  console.log('Direct API:', directResult.ok ? '✅ SUCCESS' : `❌ FAILED (${directResult.status || 'ERROR'})`);
  console.log('Proxy API:', proxyResult.ok ? '✅ SUCCESS' : `❌ FAILED (${proxyResult.status || 'ERROR'})`);
  
  if (!directResult.ok && !proxyResult.ok) {
    console.log('\n⚠️  Both tests failed - API connectivity issue');
  } else if (directResult.ok && !proxyResult.ok) {
    console.log('\n⚠️  Direct works but proxy fails - check server configuration');
  } else if (!directResult.ok && proxyResult.ok) {
    console.log('\n✅ Proxy works (expected) - application should function normally');
  } else {
    console.log('\n✅ Both tests successful - API fully operational');
  }
}

// Make functions available globally
window.testDirectStaffAPI = testDirectStaffAPI;
window.testProxyAPI = testProxyAPI;
window.runAllTests = runAllTests;

// Auto-run the comprehensive test
runAllTests();