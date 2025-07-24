/**
 * Current API Status Debug - Run in Browser Console
 * This script checks the ACTUAL current API configuration
 */

console.log('🔍 CURRENT API STATUS DEBUG');
console.log('==========================');

// Check what's actually loaded in the browser
console.log('1. Environment Variable Check:');
console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('   Expected:', 'https://staff.boreal.financial/api');
console.log('   Match:', import.meta.env.VITE_API_BASE_URL === 'https://staff.boreal.financial/api' ? '✅ YES' : '❌ NO');

// Check constants.ts actual value
console.log('\n2. Check what API_BASE_URL resolves to:');
try {
  // This will show what the app is actually using
  const testUrl = new URL('/api/public/applications', window.location.origin);
  console.log('   Constructed URL:', testUrl.toString());
  console.log('   Origin:', window.location.origin);
} catch (e) {
  console.log('   Error constructing URL:', e.message);
}

// Test actual fetch call like the app does
console.log('\n3. Testing actual app API call pattern:');
async function testRealAppCall() {
  try {
    const response = await fetch('/api/public/applications', {
      method: 'OPTIONS', // Safe method that won't create data
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('   Response URL:', response.url);
    console.log('   Response Status:', response.status);
    console.log('   This shows where /api actually routes to');
    
    return response.url;
  } catch (error) {
    console.log('   Error:', error.message);
    return null;
  }
}

testRealAppCall();

// Check if we can reach staff backend directly
console.log('\n4. Direct staff backend test:');
async function testStaffDirect() {
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'missing'}`
      }
    });
    
    console.log('   Direct staff API status:', response.status);
    console.log('   Direct staff API URL:', response.url);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Direct staff API working, products:', data.products?.length || 'unknown');
    }
  } catch (error) {
    console.log('   ❌ Direct staff API error:', error.message);
  }
}

testStaffDirect();

console.log('\n5. All environment variables:');
console.log(import.meta.env);