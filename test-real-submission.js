/**
 * Test Real Application Submission
 * Test the actual submission flow to get a valid application ID for SignNow
 */

const STAFF_API_URL = 'https://staff.boreal.financial/api/public';
const BEARER_TOKEN = 'ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042';

async function testRealSubmission() {
  console.log('🧪 Testing real application submission...');
  
  try {
    // Prepare test application data with correct staff backend format
    const applicationData = {
      step1: {
        // Step 1 data
        headquarters: 'CA',
        industry: 'Technology',
        lookingFor: 'Equipment Financing',
        fundingAmount: 50000,
        salesHistory: '1 to 2 years',
        averageMonthlyRevenue: 15000,
        accountsReceivableBalance: 5000,
        fixedAssetsValue: 25000,
        equipmentValue: 50000,
      },
      step3: {
        operatingName: 'Test Equipment Company Ltd',
        legalName: 'Test Equipment Company Limited',
        businessStreetAddress: '123 Test Street',
        businessCity: 'Vancouver',
        businessState: 'BC',
        businessPostalCode: 'V6T 1Z4',
        businessPhone: '(604) 123-4567',
        businessWebsite: 'https://testcompany.ca',
        businessStructure: 'Corporation',
        businessRegistrationDate: '2023-01-15',
        businessTaxId: '123456789BC0001',
        businessDescription: 'Technology equipment leasing and financing',
        numberOfEmployees: 5,
        primaryBankName: 'Royal Bank of Canada',
        bankingRelationshipLength: '1-2 years',
      },
      step4: {
        applicantFirstName: 'John',
        applicantLastName: 'Smith',
        applicantEmail: 'john@testcompany.ca',
        applicantPhone: '(604) 987-6543',
        applicantAddress: '456 Home Avenue',
        applicantCity: 'Vancouver',
        applicantState: 'BC',
        applicantZipCode: 'V6R 2K8',
        applicantDateOfBirth: '1985-03-15',
        applicantSSN: '456 789 123',
        ownershipPercentage: 100,
      },
      uploadedDocuments: [],
      productId: 'equipment_financing_ca_001',
      clientId: 'client_test_' + Date.now(),
    };

    console.log('📤 Submitting application to:', `${STAFF_API_URL}/applications`);
    console.log('📋 Application data:', JSON.stringify(applicationData, null, 2));

    const response = await fetch(`${STAFF_API_URL}/applications`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Origin': 'https://clientportal.boreal.financial',
        'Referer': 'https://clientportal.boreal.financial/apply/step-4',
      },
      body: JSON.stringify(applicationData),
    });

    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Submission failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Submission successful:', result);
    
    if (result.applicationId) {
      console.log('🎯 Got valid application ID:', result.applicationId);
      
      // Now test the SignNow status endpoint with this valid ID
      await testSigningStatus(result.applicationId);
    }
    
    return result;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

async function testSigningStatus(applicationId) {
  console.log('🔍 Testing signing status with valid ID:', applicationId);
  
  try {
    const response = await fetch(`${STAFF_API_URL}/applications/${applicationId}/signing-status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Origin': 'https://clientportal.boreal.financial',
        'Referer': 'https://clientportal.boreal.financial/apply/step-6',
      },
    });

    console.log('📊 Signing status response:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Status check failed:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Signing status:', result);
    
    if (result.status === 'pending') {
      console.log('⏳ Status is "pending" - SignNow integration is working!');
    }
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

// Run the test
testRealSubmission();