/**
 * Test SignNow API Endpoints with Bearer Token Authentication
 * Tests the Step 6 workflow endpoints to verify proper token authentication
 */

const API_BASE_URL = 'https://staff.boreal.financial/api';
const BEARER_TOKEN = 'ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042';

async function testSignNowAPI() {
  console.log('🧪 Testing SignNow API Endpoints with Bearer Token Authentication');
  console.log('=' * 60);

  // Test Application ID (use real ID or fallback for testing)
  const testApplicationId = 'app_test_123456';

  const tests = [
    {
      name: 'Signing Status Check',
      endpoint: `/applications/${testApplicationId}/signing-status`,
      method: 'GET'
    },
    {
      name: 'Signing URL Retrieval',
      endpoint: `/applications/${testApplicationId}/signing-url`,
      method: 'GET'
    },
    {
      name: 'Application Status',
      endpoint: `/applications/${testApplicationId}`,
      method: 'GET'
    },
    {
      name: 'Health Check',
      endpoint: '/health',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    console.log(`\n📡 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.method} ${API_BASE_URL}${test.endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Response:`, JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   🚨 Network Error: ${error.message}`);
    }
  }

  console.log('\n🔧 Testing Manual Application Creation');
  
  // Test application creation with minimal data
  const testApplication = {
    businessName: 'Test SignNow Company',
    fundingAmount: 50000,
    lookingFor: 'capital',
    businessLocation: 'US'
  };

  try {
    const createResponse = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testApplication)
    });

    console.log(`   Create Status: ${createResponse.status} ${createResponse.statusText}`);
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log(`   ✅ Created Application:`, JSON.stringify(createData, null, 2));
      
      if (createData.applicationId) {
        // Test signing initiation with the new application
        console.log('\n🖊️ Testing Signing Initiation');
        
        const signingResponse = await fetch(`${API_BASE_URL}/applications/${createData.applicationId}/initiate-signing`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessName: testApplication.businessName,
            fundingAmount: testApplication.fundingAmount
          })
        });

        console.log(`   Signing Status: ${signingResponse.status} ${signingResponse.statusText}`);
        
        if (signingResponse.ok) {
          const signingData = await signingResponse.json();
          console.log(`   ✅ Signing Initiated:`, JSON.stringify(signingData, null, 2));
        } else {
          const signingError = await signingResponse.text();
          console.log(`   ❌ Signing Error: ${signingError}`);
        }
      }
    } else {
      const createError = await createResponse.text();
      console.log(`   ❌ Create Error: ${createError}`);
    }
  } catch (error) {
    console.log(`   🚨 Application Creation Error: ${error.message}`);
  }

  console.log('\n' + '=' * 60);
  console.log('🎯 SignNow API Test Complete');
  console.log('\nExpected Results:');
  console.log('✅ All endpoints should return 200 OK with Bearer token');
  console.log('✅ Signing status should return { ready: true } for valid apps');
  console.log('✅ Signing URL should return { signingUrl: "https://..." }');
  console.log('✅ Application creation should return { applicationId: "app_..." }');
}

// Run the test
testSignNowAPI().catch(console.error);