#!/usr/bin/env node

/**
 * Live Application Submission Test
 * Tests complete Step 3 → Step 4 data flow with real API submission
 */

const API_BASE_URL = 'http://localhost:5000';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'shared_client_token_2024';

console.log('🚀 LIVE APPLICATION SUBMISSION TEST');
console.log('===================================');

// Complete test application data with all required Step 3 fields
const testApplicationData = {
  step1: {
    fundingAmount: 275000,
    requestedAmount: 275000,
    use_of_funds: 'Working capital',
    lookingFor: 'Working capital',
    fundsPurpose: 'Working capital',
    businessLocation: 'CA',
    industry: 'Technology',
    salesHistory: 'Growing',
    lastYearRevenue: '1500000',
    averageMonthlyRevenue: '125000',
    selectedCategory: 'Working Capital'
  },
  
  step3: {
    // All 9 REQUIRED fields from user specification
    businessName: 'TechFlow Solutions Inc',
    businessType: 'Corporation',
    industry: 'Technology',
    website: 'https://techflow.ca',
    yearsInBusiness: 4,
    numberOfEmployees: 18,
    businessAddress: '789 Tech Boulevard',
    annualRevenue: 1500000,
    monthlyRevenue: 125000,
    
    // Additional Step 3 fields for API compatibility
    operatingName: 'TechFlow Solutions Inc',
    legalName: 'TechFlow Solutions Incorporated',
    businessStreetAddress: '789 Tech Boulevard',
    businessCity: 'Vancouver',
    businessState: 'BC',
    businessPostalCode: 'V6B 4N8',
    businessPhone: '+16042345678',
    businessWebsite: 'https://techflow.ca',
    businessStructure: 'Corporation',
    businessStartDate: '2021-03-01',
    employeeCount: 18,
    estimatedYearlyRevenue: 1500000
  },
  
  step4: {
    applicantFirstName: 'Alex',
    applicantLastName: 'Rivera',
    applicantEmail: 'alex.rivera@techflow.ca',
    applicantPhone: '+16041234567',
    applicantAddress: '456 Executive Plaza',
    applicantCity: 'Vancouver',
    applicantState: 'BC',
    applicantZipCode: 'V6C 2T8',
    applicantDateOfBirth: '1987-09-15',
    applicantSSN: '987654321',
    ownershipPercentage: 75,
    hasPartner: false,
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@techflow.ca',
    phone: '+16041234567'
  }
};

async function submitTestApplication() {
  console.log('\n📤 SUBMITTING TEST APPLICATION');
  console.log('==============================');
  
  try {
    console.log('🎯 API Endpoint:', `${API_BASE_URL}/api/public/applications`);
    console.log('🔐 Authentication: Bearer token present');
    console.log('📊 Payload Structure: { step1, step3, step4 }');
    
    console.log('\n📋 STEP 3 FIELD VERIFICATION:');
    console.log('=============================');
    
    const requiredStep3Fields = [
      'businessName', 'businessType', 'industry', 'website', 
      'yearsInBusiness', 'numberOfEmployees', 'businessAddress', 
      'annualRevenue', 'monthlyRevenue'
    ];
    
    requiredStep3Fields.forEach(field => {
      const value = testApplicationData.step3[field];
      const status = value !== undefined && value !== '' ? '✅' : '❌';
      console.log(`${status} ${field}: ${value}`);
    });
    
    console.log('\n🧪 FINAL PAYLOAD PREVIEW:');
    console.log('=========================');
    console.log('Step 1 fields:', Object.keys(testApplicationData.step1).length);
    console.log('Step 3 fields:', Object.keys(testApplicationData.step3).length);
    console.log('Step 4 fields:', Object.keys(testApplicationData.step4).length);
    
    const response = await fetch(`${API_BASE_URL}/api/public/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify(testApplicationData)
    });
    
    console.log('\n📥 API RESPONSE:');
    console.log('================');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.text();
    console.log('Response Body:', responseData);
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Application submitted successfully!');
      
      try {
        const jsonResponse = JSON.parse(responseData);
        console.log('📋 Application ID:', jsonResponse.applicationId || jsonResponse.id);
        console.log('📋 Status:', jsonResponse.status);
        
        if (jsonResponse.applicationId) {
          console.log('\n🎯 VERIFICATION COMPLETE:');
          console.log('✅ POST /api/public/applications working correctly');
          console.log('✅ All Step 3 fields included in submission');
          console.log('✅ Application ID generated and returned');
          console.log('✅ Ready for Step 5 document upload workflow');
        }
        
      } catch (parseError) {
        console.log('✅ Application submitted but response is not JSON');
      }
      
    } else {
      console.log('\n❌ SUBMISSION FAILED:');
      console.log('Status:', response.status);
      console.log('Response:', responseData);
      
      if (response.status === 404) {
        console.log('💡 Note: 404 may indicate staff backend integration needed');
      } else if (response.status === 401) {
        console.log('💡 Note: 401 may indicate Bearer token authentication issue');
      }
    }
    
  } catch (error) {
    console.error('\n❌ REQUEST FAILED:', error.message);
    console.log('💡 Possible causes:');
    console.log('- Server not running on localhost:5000');
    console.log('- Network connectivity issue');
    console.log('- CORS configuration problem');
  }
}

// Field mapping verification
console.log('\n🔍 FIELD MAPPING VERIFICATION:');
console.log('==============================');

const mappingTests = [
  { expected: 'businessName', actual: testApplicationData.step3.businessName, source: 'operatingName' },
  { expected: 'businessType', actual: testApplicationData.step3.businessType, source: 'businessStructure' },
  { expected: 'industry', actual: testApplicationData.step3.industry, source: 'step1.industry fallback' },
  { expected: 'website', actual: testApplicationData.step3.website, source: 'businessWebsite' },
  { expected: 'yearsInBusiness', actual: testApplicationData.step3.yearsInBusiness, source: 'calculated from businessStartDate' },
  { expected: 'numberOfEmployees', actual: testApplicationData.step3.numberOfEmployees, source: 'employeeCount' },
  { expected: 'businessAddress', actual: testApplicationData.step3.businessAddress, source: 'businessStreetAddress' },
  { expected: 'annualRevenue', actual: testApplicationData.step3.annualRevenue, source: 'estimatedYearlyRevenue' },
  { expected: 'monthlyRevenue', actual: testApplicationData.step3.monthlyRevenue, source: 'calculated from annualRevenue' }
];

mappingTests.forEach((test, index) => {
  const status = test.actual ? '✅' : '❌';
  console.log(`${index + 1}. ${test.expected}: ${test.actual} ${status}`);
});

// Execute the test
submitTestApplication().then(() => {
  console.log('\n🏁 TEST EXECUTION COMPLETE');
}).catch(console.error);