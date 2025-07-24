/**
 * ACTUAL BROWSER CONFIG CHECK
 * This checks what the browser ACTUALLY sees, not what we think it sees
 */

console.log('🔍 CHECKING ACTUAL BROWSER CONFIGURATION');
console.log('========================================');

// Check what environment variables are actually loaded
console.log('1. Environment Variables in Browser:');
console.log('   VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'UNDEFINED');
console.log('   VITE_CLIENT_APP_SHARED_TOKEN exists:', !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN);
console.log('   Current location:', window.location.href);

// Check what constants.ts is actually using
console.log('\n2. Checking API_BASE_URL from constants:');
// Since we can't directly import, let's check what network requests show

// Check what the app is actually doing when it makes API calls
console.log('\n3. Testing actual API endpoint resolution:');

// Method 1: Check what URL fetch resolves to
const testUrl = new URL('/api/public/lenders', window.location.origin);
console.log('   Local API URL resolves to:', testUrl.toString());

// Method 2: Make a real API call and see where it goes
async function testRealApiCall() {
  try {
    const response = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('   Real API call status:', response.status);
    console.log('   Real API call URL:', response.url);
    console.log('   Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('   Response data type:', typeof data);
      console.log('   Products found:', data.products?.length || 'none');
    } else {
      const text = await response.text();
      console.log('   Error response:', text.substring(0, 200));
    }
    
    return response.url;
  } catch (error) {
    console.log('   API call failed:', error.message);
    return null;
  }
}

// Method 3: Check what the form submission would actually do
async function testFormSubmission() {
  console.log('\n4. Testing form submission endpoint:');
  
  try {
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify({
        step1: { fundingAmount: 10000 },
        step3: { businessName: 'Test' },
        step4: { applicantFirstName: 'Test' }
      })
    });
    
    console.log('   Form submission status:', response.status);
    console.log('   Form submission URL:', response.url);
    
    const text = await response.text();
    console.log('   Response preview:', text.substring(0, 200));
    
    return response;
  } catch (error) {
    console.log('   Form submission failed:', error.message);
    return null;
  }
}

// Run all tests
async function runActualCheck() {
  console.log('\n🚀 Running actual configuration check...\n');
  
  const apiUrl = await testRealApiCall();
  const formResponse = await testFormSubmission();
  
  console.log('\n📊 ACTUAL RESULTS:');
  console.log('Environment API URL:', import.meta.env.VITE_API_BASE_URL || 'MISSING');
  console.log('API endpoint resolves to:', apiUrl || 'FAILED');
  console.log('Form submission works:', formResponse?.ok ? 'YES' : 'NO');
  
  if (apiUrl && apiUrl.includes('staff.boreal.financial')) {
    console.log('✅ CONFIRMED: API correctly routes to staff.boreal.financial');
  } else if (apiUrl && apiUrl.includes('staffportal.replit.app')) {
    console.log('❌ PROBLEM: API still routes to old staffportal.replit.app');
  } else {
    console.log('❌ PROBLEM: API routing unclear or failed');
  }
}

// Make available globally and run
window.runActualCheck = runActualCheck;
runActualCheck();