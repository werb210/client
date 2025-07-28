/**
 * Test Client-to-Backend Requests
 * Verify Step 4 → Step 6 applicationId flow works with backend API
 */

const VITE_CLIENT_APP_SHARED_TOKEN = 'your_token_here'; // Replace with actual token

async function testClientBackendRequests() {
  console.log('🧪 Testing Client-to-Backend Requests');
  
  // Test 1: POST /applications
  console.log('\n1. Testing POST /applications');
  
  const formData = {
    businessName: 'Test Business',
    businessLocation: 'Canada',
    fundingAmount: 50000,
    lookingFor: 'working_capital',
    salesHistory: '1-2-years',
    lastYearRevenue: '100000-250000',
    averageMonthlyRevenue: '10000-25000',
    accountsReceivableBalance: '25000-50000',
    fixedAssetsValue: '50000-100000',
    // Add more fields as needed
  };
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_CLIENT_APP_SHARED_TOKEN}`,
      },
      body: JSON.stringify(formData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ POST /applications SUCCESS');
      console.log('Response data:', result);
      
      const applicationId = result.applicationId || result.id || result.uuid;
      console.log('ApplicationId:', applicationId);
      
      if (applicationId) {
        // Test 2: POST /signnow/create
        console.log('\n2. Testing POST /signnow/create');
        await testSignNowCreate(applicationId);
        
        // Test 3: GET /signing-status
        console.log('\n3. Testing GET /signing-status');
        await testSigningStatus(applicationId);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ POST /applications FAILED');
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

async function testSignNowCreate(applicationId) {
  try {
    const response = await fetch('https://staff.boreal.financial/api/signnow/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_CLIENT_APP_SHARED_TOKEN}`,
      },
      body: JSON.stringify({ applicationId }),
    });
    
    console.log('SignNow create status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ POST /signnow/create SUCCESS');
      console.log('SignNow response:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ POST /signnow/create FAILED');
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ SignNow create error:', error);
  }
}

async function testSigningStatus(applicationId) {
  try {
    const response = await fetch(`https://staff.boreal.financial/api/public/applications/${applicationId}/signing-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VITE_CLIENT_APP_SHARED_TOKEN}`,
      },
    });
    
    console.log('Signing status response:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ GET /signing-status SUCCESS');
      console.log('Signing status:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ GET /signing-status FAILED');
      console.error('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Signing status error:', error);
  }
}

// Run the test
testClientBackendRequests();