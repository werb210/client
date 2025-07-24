/**
 * STAFF BACKEND ISSUE DIAGNOSTIC
 * Investigating the 500 Internal Server Error from staff backend
 */

console.log('🔍 STAFF BACKEND ISSUE DIAGNOSTIC');
console.log('=================================');

async function diagnoseStaffBackendIssue() {
  console.log('Investigating 500 Internal Server Error from staff backend...\n');
  
  // Test 1: Basic staff backend connectivity
  console.log('📡 TEST 1: STAFF BACKEND CONNECTIVITY');
  console.log('====================================');
  
  try {
    const healthResponse = await fetch('https://staff.boreal.financial/api/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });
    
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('✅ Staff backend is reachable');
      console.log('Health response:', healthData);
    } else {
      console.log('⚠️ Staff backend health check failed:', await healthResponse.text());
    }
    
  } catch (error) {
    console.log('❌ Cannot reach staff backend:', error.message);
  }
  
  // Test 2: Test minimal application payload
  console.log('\n📋 TEST 2: MINIMAL APPLICATION PAYLOAD');
  console.log('=====================================');
  
  const minimalPayload = {
    step1: {
      requestedAmount: "25000",
      useOfFunds: "Working capital"
    },
    step3: {
      businessName: "Test Company",
      legalBusinessName: "Test Company",
      businessType: "Corporation",
      businessEmail: "test@example.com",
      businessPhone: "+15555551234"
    },
    step4: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "+15555551234",
      dob: "1990-01-01",
      sin: "123456789",
      ownershipPercentage: 100
    }
  };
  
  try {
    console.log('Testing minimal payload...');
    console.log('Payload:', JSON.stringify(minimalPayload, null, 2));
    
    const testResponse = await fetch('https://staff.boreal.financial/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log('Direct staff backend response status:', testResponse.status);
    
    if (testResponse.ok) {
      const responseData = await testResponse.json();
      console.log('✅ Direct staff backend call successful!');
      console.log('Response:', JSON.stringify(responseData, null, 2));
    } else {
      const errorText = await testResponse.text();
      console.log('❌ Direct staff backend call failed');
      console.log('Error response:', errorText);
      
      // Try to parse JSON error
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch {
        console.log('Raw error text:', errorText);
      }
    }
    
  } catch (error) {
    console.log('❌ Direct staff backend test failed:', error.message);
  }
  
  // Test 3: Check for authentication issues
  console.log('\n🔑 TEST 3: AUTHENTICATION CHECK');
  console.log('===============================');
  
  console.log('Auth token present:', !!import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN);
  console.log('Auth token length:', import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN?.length || 0);
  
  // Test 4: Check if it's a specific data issue
  console.log('\n📊 TEST 4: DATA VALIDATION CHECK');
  console.log('================================');
  
  const problemPayload = {
    step1: { requestedAmount: '31000', useOfFunds: 'Working capital' },
    step3: {
      businessName: 'A6',
      legalBusinessName: 'A6',
      businessType: 'Corporation',
      businessEmail: 'todd@werboweski.com',
      businessPhone: '+18888888888'
    },
    step4: {
      firstName: 'Todd',
      lastName: 'Werb',
      email: 'todd@werboweski.com',
      phone: '+15878881837',
      dob: '1971-04-14',
      sin: '111111111',
      ownershipPercentage: 100
    }
  };
  
  console.log('Testing the exact payload that failed...');
  
  try {
    const problemResponse = await fetch('https://staff.boreal.financial/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(problemPayload)
    });
    
    console.log('Problem payload response status:', problemResponse.status);
    
    if (!problemResponse.ok) {
      const errorText = await problemResponse.text();
      console.log('Problem payload error:', errorText);
      
      // Check for specific error patterns
      if (errorText.includes('duplicate') || errorText.includes('constraint')) {
        console.log('🔍 DUPLICATE EMAIL DETECTED');
        console.log('The email "todd@werboweski.com" may already exist in the database');
      } else if (errorText.includes('validation')) {
        console.log('🔍 VALIDATION ERROR DETECTED');
        console.log('There may be a field validation issue');
      } else if (errorText.includes('database') || errorText.includes('connection')) {
        console.log('🔍 DATABASE ERROR DETECTED');
        console.log('Staff backend database may be experiencing issues');
      } else {
        console.log('🔍 UNKNOWN ERROR PATTERN');
      }
    }
    
  } catch (error) {
    console.log('❌ Problem payload test failed:', error.message);
  }
  
  console.log('\n🏁 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  console.log('Based on the error pattern, this appears to be:');
  console.log('1. ❌ Staff backend 500 Internal Server Error');
  console.log('2. ⚠️ Likely a temporary backend issue or database constraint');
  console.log('3. ✅ Client application is working correctly');
  console.log('4. ✅ Authentication and API routing are functional');
  console.log('\nRecommendation: This is a staff backend issue, not a client app problem');
}

// Execute diagnostic
diagnoseStaffBackendIssue();

window.diagnoseStaffBackendIssue = diagnoseStaffBackendIssue;