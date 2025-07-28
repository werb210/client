#!/usr/bin/env node

/**
 * Bearer Token Authentication Test
 * Tests staff backend endpoints with Authorization header
 */

const BASE_URL = 'https://staffportal.replit.app/api';
const SHARED_TOKEN = 'CLIENT_APP_SHARED_TOKEN';

const testData = {
  step1: { fundingAmount: "500000", businessLocation: "canada" },
  step3: { operatingName: "Black Label Automation", legalName: "5729841 MANITOBA LTD" },
  step4: { firstName: "John", lastName: "Smith", email: "john.smith@blacklabelae.ca" }
};

async function testBearerAuth() {
  console.log('🔧 Bearer Token Authentication Test');
  console.log('===================================');
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Token: ${SHARED_TOKEN}`);
  console.log(`Time: ${new Date().toISOString()}`);

  // Test application creation
  console.log('\n📋 Testing POST /applications with Bearer token...');
  try {
    const response = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SHARED_TOKEN}`
      },
      body: JSON.stringify(testData)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ SUCCESS: Application endpoint working with Bearer token');
      const data = await response.json();
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    } else if (response.status === 401) {
      console.log('❌ UNAUTHORIZED: Bearer token not accepted or invalid');
    } else if (response.status === 404) {
      console.log('❌ NOT FOUND: Endpoint still missing');
    } else {
      console.log(`⚠️ UNEXPECTED: ${response.status} response`);
      const text = await response.text();
      console.log(`Response: ${text}`);
    }

  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
  }

  // Test document upload endpoint
  console.log('\n📄 Testing POST /upload/:id with Bearer token...');
  try {
    const formData = new FormData();
    formData.append('category', 'Banking Statements');
    
    const response = await fetch(`${BASE_URL}/api/upload/test-app-id`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SHARED_TOKEN}`
      },
      body: formData
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ SUCCESS: Upload endpoint working with Bearer token');
    } else if (response.status === 401) {
      console.log('❌ UNAUTHORIZED: Bearer token not accepted for uploads');
    } else if (response.status === 404) {
      console.log('❌ NOT FOUND: Upload endpoint still missing');
    } else {
      console.log(`⚠️ UNEXPECTED: ${response.status} response`);
    }

  } catch (error) {
    console.log(`❌ NETWORK ERROR: ${error.message}`);
  }

  console.log('\n📊 CONCLUSION:');
  console.log('If endpoints return 200/201: Bearer token authentication working');
  console.log('If endpoints return 401: Token invalid or authentication method incorrect');
  console.log('If endpoints return 404: Endpoints still missing from staff backend');
}

testBearerAuth().catch(console.error);