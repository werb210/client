/**
 * STAFF API CONNECTIVITY TEST
 * Direct test to verify if submissions are reaching the staff backend
 * Run this in browser console to check real API status
 */

async function testStaffAPIConnectivity() {
  console.log('🧪 STAFF API CONNECTIVITY TEST');
  console.log('==============================');
  
  // Test 1: Check if local server is proxying correctly
  console.log('\n📡 Test 1: Local Server Proxy Test');
  try {
    const testResponse = await fetch('/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('Local proxy status:', testResponse.status);
    console.log('Local proxy headers:', [...testResponse.headers.entries()]);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Local proxy working - Staff API reachable');
      console.log('Products received:', data?.data?.length || 0);
    } else {
      console.log('❌ Local proxy failed:', testResponse.statusText);
    }
  } catch (proxyError) {
    console.log('❌ Local proxy error:', proxyError.message);
  }
  
  // Test 2: Direct staff backend test
  console.log('\n🌐 Test 2: Direct Staff Backend Test');
  try {
    const directResponse = await fetch('https://staff.boreal.financial/api/public/lenders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Direct staff status:', directResponse.status);
    console.log('Direct staff response time:', Date.now());
    
    if (directResponse.ok) {
      console.log('✅ Direct staff backend reachable');
    } else {
      console.log('❌ Direct staff backend failed:', directResponse.statusText);
    }
  } catch (directError) {
    console.log('❌ Direct staff backend error:', directError.message);
  }
  
  // Test 3: Application creation test with minimal payload
  console.log('\n📝 Test 3: Application Creation Test');
  const testPayload = {
    step1: {
      fundingAmount: 50000,
      lookingFor: "capital",
      businessLocation: "US"
    },
    step3: {
      operatingName: "Test Company",
      legalName: "Test Company LLC"
    },
    step4: {
      applicantFirstName: "Test",
      applicantLastName: "User",
      applicantEmail: "test@example.com"
    }
  };
  
  try {
    console.log('📤 Sending test application:', testPayload);
    
    const createResponse = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Application creation status:', createResponse.status);
    console.log('Application creation response:', createResponse.statusText);
    
    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ APPLICATION SUCCESSFULLY CREATED!');
      console.log('📋 Staff backend response:', result);
      console.log('🔑 Application ID:', result.applicationId || result.id);
      
      return {
        success: true,
        applicationId: result.applicationId || result.id,
        message: 'Staff backend is receiving submissions successfully'
      };
    } else {
      const errorText = await createResponse.text();
      console.log('❌ APPLICATION CREATION FAILED');
      console.log('Error details:', errorText);
      
      return {
        success: false,
        error: errorText,
        message: 'Staff backend is not receiving submissions'
      };
    }
  } catch (createError) {
    console.log('❌ Application creation network error:', createError.message);
    return {
      success: false,
      error: createError.message,
      message: 'Network connectivity issue preventing submissions'
    };
  }
}

// Auto-run the test
testStaffAPIConnectivity().then(result => {
  console.log('\n🎯 FINAL RESULT:');
  console.log('================');
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  if (result.applicationId) {
    console.log('Test Application ID:', result.applicationId);
  }
  if (result.error) {
    console.log('Error:', result.error);
  }
});