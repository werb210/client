/**
 * Test 409 Duplicate Response Handling
 * Tests the new duplicate application detection and error handling
 */

const API_BASE_URL = window.location.origin;

// Test application data that should trigger a duplicate
const testApplicationData = {
  step1: {
    requestedAmount: 50000,
    use_of_funds: "working_capital",
    businessLocation: "CA",
    salesHistory: "3+yr",
    lastYearRevenue: 500000,
    averageMonthlyRevenue: 41667,
    accountsReceivableBalance: 25000,
    fixedAssetsValue: 100000,
    purposeOfFunds: "expansion"
  },
  step3: {
    operatingName: "Test Business Corp",
    legalName: "Test Business Corporation",
    businessAddress: "123 Test Street",
    businessCity: "Toronto",
    businessState: "ON",
    businessZip: "M5V 3A1",
    businessPhone: "+1-416-555-0123",
    businessStructure: "corporation",
    businessStartDate: "2020-01-01",
    numberOfEmployees: 15,
    annualRevenue: 500000,
    businessName: "Test Business Corporation"
  },
  step4: {
    applicantFirstName: "John",
    applicantLastName: "Doe",
    applicantEmail: "john.doe@testbusiness.com",
    applicantPhone: "+1-416-555-0124",
    applicantAddress: "456 Personal Ave",
    applicantCity: "Toronto",
    applicantState: "ON",
    applicantZipCode: "M5V 3B2",
    applicantDateOfBirth: "1985-06-15",
    applicantSSN: "123456789",
    ownershipPercentage: 100,
    hasPartner: false,
    email: "john.doe@testbusiness.com"
  }
};

async function test409DuplicateHandling() {
  console.log('🧪 =================================');
  console.log('🧪 TESTING 409 DUPLICATE HANDLING');
  console.log('🧪 =================================');
  
  try {
    // First submission - should succeed and create application
    console.log('📤 First submission (should succeed)...');
    const firstResponse = await fetch(`${API_BASE_URL}/api/public/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(testApplicationData)
    });
    
    console.log(`📥 First response: ${firstResponse.status} ${firstResponse.statusText}`);
    
    if (firstResponse.ok) {
      const firstResult = await firstResponse.json();
      console.log('✅ First submission successful:', firstResult);
      
      const applicationId = firstResult.applicationId || firstResult.id;
      console.log('🔑 Application ID created:', applicationId);
      
      // Second submission with same data - should return 409
      console.log('\n📤 Second submission (should return 409)...');
      const secondResponse = await fetch(`${API_BASE_URL}/api/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: JSON.stringify(testApplicationData)
      });
      
      console.log(`📥 Second response: ${secondResponse.status} ${secondResponse.statusText}`);
      
      if (secondResponse.status === 409) {
        const duplicateError = await secondResponse.json();
        console.log('✅ 409 Duplicate detected correctly:', duplicateError);
        
        // Verify error structure
        if (duplicateError.error === 'Duplicate application detected') {
          console.log('✅ Error message correct');
        } else {
          console.log('❌ Unexpected error message:', duplicateError.error);
        }
        
        if (duplicateError.applicationId) {
          console.log('✅ Application ID returned in duplicate response:', duplicateError.applicationId);
        } else {
          console.log('❌ No application ID in duplicate response');
        }
        
        if (duplicateError.message) {
          console.log('✅ Duplicate message provided:', duplicateError.message);
        }
        
      } else if (secondResponse.ok) {
        console.log('⚠️ Second submission unexpectedly succeeded (duplicate detection may not be working)');
        const secondResult = await secondResponse.json();
        console.log('Second result:', secondResult);
      } else {
        const errorText = await secondResponse.text();
        console.log(`❌ Unexpected error status ${secondResponse.status}:`, errorText);
      }
      
    } else {
      const errorText = await firstResponse.text();
      console.log('❌ First submission failed:', errorText);
      
      if (firstResponse.status === 409) {
        console.log('ℹ️ Got 409 on first submission - duplicate already exists from previous test');
        const duplicateData = JSON.parse(errorText);
        console.log('Existing application:', duplicateData);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('\n🧪 Test complete - check console for results');
}

// Test with bypass header
async function test409WithBypass() {
  console.log('\n🧪 =================================');
  console.log('🧪 TESTING DUPLICATE BYPASS HEADER');
  console.log('🧪 =================================');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`,
        'x-allow-duplicate': 'true'
      },
      body: JSON.stringify(testApplicationData)
    });
    
    console.log(`📥 Bypass response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Bypass successful (duplicate allowed):', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Bypass failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Bypass test failed:', error);
  }
}

// Export functions for browser console
window.test409DuplicateHandling = test409DuplicateHandling;
window.test409WithBypass = test409WithBypass;

// Run tests if script is executed directly
if (typeof window !== 'undefined') {
  console.log('🧪 409 Duplicate Handling Test Suite Loaded');
  console.log('🧪 Run: test409DuplicateHandling() or test409WithBypass()');
}