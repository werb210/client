#!/usr/bin/env node

/**
 * 🚨 CLIENT APPLICATION PAYLOAD STRUCTURE TEST
 * Tests the complete Steps 1-4 payload structure as requested
 */

const APPLICATION_ID = 'test-application-' + Date.now();

// Complete test data matching the expected structure
const testData = {
  step1: {
    // Core funding request
    fundingAmount: 50000,
    requestedAmount: 50000,
    use_of_funds: 'working_capital',
    lookingFor: 'working_capital',
    fundsPurpose: 'working_capital',
    
    // Business context
    businessLocation: 'CA',
    industry: 'manufacturing',
    
    // Financial metrics
    salesHistory: '2-5-years',
    lastYearRevenue: '250k-500k',
    averageMonthlyRevenue: '25k-50k',
    accountsReceivableBalance: 100000,
    fixedAssetsValue: 150000,
    
    // Equipment (if applicable)
    equipment_value: 0,
    equipmentValue: 0,
    
    // Step 2 integration
    selectedCategory: 'working_capital'
  },
  
  step3: {
    // Core business identity
    operatingName: 'A1 Test Company',
    legalName: 'A1 Test Company Inc.',
    businessName: 'A1 Test Company',
    
    // Business address
    businessAddress: '123 Test Street',
    businessStreetAddress: '123 Test Street',
    businessCity: 'Toronto',
    businessState: 'ON',
    businessZip: 'M5V 3A8',
    businessPostalCode: 'M5V 3A8',
    
    // Contact information
    businessPhone: '+14165551234',
    businessWebsite: 'https://a1test.com',
    
    // Business details
    businessStructure: 'corporation',
    businessStartDate: '2020-01-01',
    numberOfEmployees: 10,
    employeeCount: 10,
    annualRevenue: 500000,
    estimatedYearlyRevenue: 500000
  },
  
  step4: {
    // Primary applicant (contact) information
    applicantFirstName: 'John',
    applicantLastName: 'Doe',
    applicantEmail: 'john.doe@test.com',
    applicantPhone: '+14165551234',
    applicantAddress: '123 Test Street',
    applicantCity: 'Toronto',
    applicantState: 'ON',
    applicantZipCode: 'M5V 3A8',
    applicantDateOfBirth: '1985-01-01',
    applicantSSN: '',
    ownershipPercentage: 100,
    
    // Contact mapping for backend compatibility
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+14165551234',
    first_name: 'John',
    last_name: 'Doe',
    
    // Partner information (not applicable for this test)
    hasPartner: false,
    partnerFirstName: '',
    partnerLastName: '',
    partnerEmail: '',
    partnerPhone: '',
    partnerAddress: '',
    partnerCity: '',
    partnerState: '',
    partnerZipCode: '',
    partnerDateOfBirth: '',
    partnerSSN: '',
    partnerOwnershipPercentage: 0
  }
};

async function testCompletePayloadStructure() {
  console.log('🚨 CLIENT APPLICATION PAYLOAD STRUCTURE TEST');
  console.log('==========================================');
  
  // Step 1: Validate payload structure
  console.log('\n📊 STEP 1: PAYLOAD STRUCTURE VALIDATION');
  
  const step1Fields = Object.keys(testData.step1);
  const step3Fields = Object.keys(testData.step3);  
  const step4Fields = Object.keys(testData.step4);
  
  console.log(`✅ Step 1 (business/funding_request): ${step1Fields.length} fields`);
  console.log('   Core fields:', {
    fundingAmount: testData.step1.fundingAmount,
    use_of_funds: testData.step1.use_of_funds,
    businessLocation: testData.step1.businessLocation,
    selectedCategory: testData.step1.selectedCategory
  });
  
  console.log(`✅ Step 3 (business details): ${step3Fields.length} fields`);
  console.log('   Core fields:', {
    businessName: testData.step3.businessName,
    operatingName: testData.step3.operatingName,
    businessPhone: testData.step3.businessPhone,
    businessState: testData.step3.businessState
  });
  
  console.log(`✅ Step 4 (contact info): ${step4Fields.length} fields`);
  console.log('   Core fields:', {
    firstName: testData.step4.firstName,
    lastName: testData.step4.lastName,
    email: testData.step4.email,
    phone: testData.step4.phone
  });
  
  // Step 2: Test API submission
  console.log('\n📤 STEP 2: API SUBMISSION TEST');
  
  try {
    console.log('🧪 FINAL PAYLOAD - COMPREHENSIVE STRUCTURE:');
    console.log('📊 Step 1 (business/funding_request):', {
      fundingAmount: testData.step1.fundingAmount,
      requestedAmount: testData.step1.requestedAmount,
      use_of_funds: testData.step1.use_of_funds,
      businessLocation: testData.step1.businessLocation,
      selectedCategory: testData.step1.selectedCategory,
      fieldCount: step1Fields.length
    });
    console.log('📊 Step 3 (business details):', {
      businessName: testData.step3.businessName,
      operatingName: testData.step3.operatingName,
      legalName: testData.step3.legalName,
      businessPhone: testData.step3.businessPhone,
      businessState: testData.step3.businessState,
      fieldCount: step3Fields.length
    });
    console.log('📊 Step 4 (contact info):', {
      firstName: testData.step4.firstName,
      lastName: testData.step4.lastName,
      email: testData.step4.email,
      phone: testData.step4.phone,
      applicantEmail: testData.step4.applicantEmail,
      fieldCount: step4Fields.length
    });
    console.log('🧪 COMPLETE PAYLOAD:', testData);
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ APPLICATION CREATION SUCCESS:', result);
      console.log('🆔 Application ID:', result.applicationId);
      
      return {
        success: true,
        applicationId: result.applicationId,
        step1Fields: step1Fields.length,
        step3Fields: step3Fields.length,
        step4Fields: step4Fields.length,
        totalFields: step1Fields.length + step3Fields.length + step4Fields.length
      };
    } else {
      const errorText = await response.text();
      console.log('❌ APPLICATION CREATION FAILED:', errorText);
      
      return {
        success: false,
        error: errorText,
        step1Fields: step1Fields.length,
        step3Fields: step3Fields.length,
        step4Fields: step4Fields.length,
        totalFields: step1Fields.length + step3Fields.length + step4Fields.length
      };
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return {
      success: false,
      error: error.message,
      step1Fields: step1Fields.length,
      step3Fields: step3Fields.length,
      step4Fields: step4Fields.length,
      totalFields: step1Fields.length + step3Fields.length + step4Fields.length
    };
  }
}

// Step 3: Browser console validation script
const BROWSER_VALIDATION_SCRIPT = `
// 🚨 BROWSER CONSOLE VALIDATION - RUN THIS IN BROWSER DEVTOOLS
(function() {
  console.log('🚨 CLIENT PAYLOAD VALIDATION SCRIPT');
  console.log('=====================================');
  
  // Check FormData context state
  if (typeof window.debugApplication === 'function') {
    const state = window.debugApplication();
    
    console.log('📊 STEP 1 VALIDATION:');
    console.log('   fundingAmount:', state.step1?.fundingAmount);
    console.log('   use_of_funds:', state.step1?.use_of_funds);
    console.log('   businessLocation:', state.step1?.businessLocation);
    console.log('   selectedCategory:', state.step2?.selectedCategory);
    
    console.log('📊 STEP 3 VALIDATION:');
    console.log('   businessName:', state.step3?.operatingName || state.step3?.businessName);
    console.log('   businessPhone:', state.step3?.businessPhone);
    console.log('   businessState:', state.step3?.businessState);
    
    console.log('📊 STEP 4 VALIDATION:');
    console.log('   firstName:', state.step4?.applicantFirstName);
    console.log('   lastName:', state.step4?.applicantLastName);
    console.log('   email:', state.step4?.applicantEmail);
    console.log('   phone:', state.step4?.applicantPhone);
    
    // Check if all required fields are present
    const hasStep1 = !!(state.step1?.fundingAmount && state.step1?.businessLocation);
    const hasStep3 = !!(state.step3?.operatingName && state.step3?.businessPhone);
    const hasStep4 = !!(state.step4?.applicantFirstName && state.step4?.applicantEmail);
    
    console.log('✅ VALIDATION RESULTS:');
    console.log('   Step 1 Complete:', hasStep1);
    console.log('   Step 3 Complete:', hasStep3);
    console.log('   Step 4 Complete:', hasStep4);
    console.log('   Overall Status:', hasStep1 && hasStep3 && hasStep4 ? 'READY' : 'INCOMPLETE');
    
    return {
      step1Complete: hasStep1,
      step3Complete: hasStep3,
      step4Complete: hasStep4,
      overallReady: hasStep1 && hasStep3 && hasStep4
    };
  } else {
    console.log('❌ window.debugApplication not available');
    return { error: 'Debug function not available' };
  }
})();
`;

console.log('\n🧪 CLIENT PAYLOAD STRUCTURE TEST READY');
console.log('======================================');
console.log('\n📋 EXPECTED STRUCTURE:');
console.log('- Step 1: business/funding_request fields');
console.log('- Step 3: business details fields'); 
console.log('- Step 4: contact information fields');
console.log('\n📱 BROWSER VALIDATION:');
console.log('Copy and paste this script in browser console:');
console.log('\n' + '='.repeat(60));
console.log(BROWSER_VALIDATION_SCRIPT);
console.log('='.repeat(60));

// Run the test if not in require mode
if (require.main === module) {
  testCompletePayloadStructure()
    .then(result => {
      console.log('\n🏆 TEST COMPLETE');
      console.log('================');
      console.log('Success:', result.success);
      console.log('Total Fields:', result.totalFields);
      console.log('Step 1 Fields:', result.step1Fields);
      console.log('Step 3 Fields:', result.step3Fields);
      console.log('Step 4 Fields:', result.step4Fields);
      
      if (result.success) {
        console.log('✅ CLIENT APPLICATION PAYLOAD STRUCTURE: WORKING');
      } else {
        console.log('❌ CLIENT APPLICATION PAYLOAD STRUCTURE: NEEDS FIXING');
        console.log('Error:', result.error);
      }
    })
    .catch(console.error);
}

module.exports = { testCompletePayloadStructure };