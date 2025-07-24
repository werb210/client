/**
 * BROWSER API REALITY TEST
 * This will tell us EXACTLY what the browser is doing with API calls
 */

console.log('🔍 TESTING BROWSER API REALITY');
console.log('==============================');

// Check what constants.ts actually exports
console.log('Environment check:');
console.log('- VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('- DEV mode:', import.meta.env.DEV);
console.log('- PROD mode:', import.meta.env.PROD);

// Test the actual API call that Step 4 makes
async function testStep4APICall() {
  console.log('\n📋 Testing Step 4 Application Creation (real workflow)');
  
  const payload = {
    step1: {
      businessLocation: "CA",
      fundingAmount: 25000,
      fundsPurpose: "working_capital"
    },
    step3: {
      operatingName: "Test Company",
      businessStructure: "corporation",
      businessCity: "Calgary",
      businessState: "AB"
    },
    step4: {
      applicantFirstName: "Test",
      applicantLastName: "User", 
      applicantEmail: "test@example.com",
      applicantPhone: "+15555555555"
    }
  };
  
  try {
    console.log('Making POST to /api/public/applications...');
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response URL:', response.url);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS - Application created:', data.applicationId);
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('❌ FAILED - Error response:', text);
    }
    
    // Key check: Does the URL show where it actually went?
    if (response.url.includes('staff.boreal.financial')) {
      console.log('✅ CONFIRMED: Request went to staff.boreal.financial');
    } else if (response.url.includes('localhost:5000')) {
      console.log('🔄 INFO: Request went through localhost proxy');
    } else {
      console.log('❓ UNKNOWN: Request went to unexpected location');
    }
    
    return response;
    
  } catch (error) {
    console.log('❌ API call failed:', error);
    return null;
  }
}

// Test lender products fetch
async function testLenderProductsFetch() {
  console.log('\n📊 Testing Lender Products Fetch');
  
  try {
    const response = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('Lenders API URL:', response.url);
    console.log('Lenders API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Lenders data received, products:', data.products?.length || 'unknown');
    }
    
    return response.url;
    
  } catch (error) {
    console.log('❌ Lenders fetch failed:', error);
    return null;
  }
}

// Run comprehensive test
async function runBrowserRealityTest() {
  console.log('🚀 Running browser reality test...\n');
  
  const step4Response = await testStep4APICall();
  const lendersUrl = await testLenderProductsFetch();
  
  console.log('\n📊 FINAL REALITY CHECK:');
  console.log('Step 4 submission works:', step4Response?.ok ? 'YES' : 'NO');
  console.log('API endpoints resolve correctly:', !!lendersUrl ? 'YES' : 'NO');
  
  // The ultimate truth test
  if (step4Response?.ok) {
    console.log('✅ VERDICT: Application submission is working');
    console.log('✅ API configuration is functional');
  } else {
    console.log('❌ VERDICT: Application submission has issues');
    console.log('❌ API configuration needs investigation');
  }
}

// Make available and run
window.runBrowserRealityTest = runBrowserRealityTest;
runBrowserRealityTest();