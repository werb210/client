/**
 * COMPREHENSIVE END-TO-END APPLICATION TEST WITH S3 DOCUMENT UPLOAD
 * 
 * This script executes a complete application workflow:
 * 1. Creates a new application through Steps 1-7
 * 2. Uploads 6 test documents 
 * 3. Finalizes the application
 * 4. Verifies staff backend reception
 * 5. Tests S3 integration
 */

console.log('🧪 COMPREHENSIVE E2E APPLICATION TEST WITH S3 UPLOAD');
console.log('='.repeat(80));

// Test Results Storage
const results = [];
const addResult = (testName, passed, details = '') => {
  results.push({ testName, passed, details });
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`${status} - ${testName}${details ? `: ${details}` : ''}`);
};

// Generate unique test data
const timestamp = Date.now();
const testBusinessName = `E2E Test Corp ${timestamp}`;
const testEmail = `test.e2e.${timestamp}@example.com`;
const applicationId = crypto.randomUUID();

console.log(`🏢 Test Business: ${testBusinessName}`);
console.log(`📧 Test Email: ${testEmail}`);
console.log(`🆔 Application ID: ${applicationId}`);

// STEP 1: CREATE APPLICATION (Steps 1-4 simulation)
console.log('\n📋 STEP 1: APPLICATION CREATION (Steps 1-4)');

const applicationData = {
  // Step 1 - Financial Profile  
  step1: {
    fundingAmount: 75000,
    requestedAmount: 75000,
    productCategory: "Equipment Financing",
    lookingFor: "Equipment Financing",
    fundsPurpose: "Equipment Purchase",
    hasPartner: false
  },
  
  // Step 2 - Product Selection (auto-populated)
  step2: {
    selectedProducts: ["Equipment Financing"],
    recommendedCategory: "Equipment Financing"
  },
  
  // Step 3 - Business Details
  step3: {
    businessType: "Corporation", 
    operatingName: testBusinessName,
    businessPhone: "+14165551234",
    businessState: "ON",
    businessCity: "Toronto",
    businessAddress: "123 Test Street",
    businessPostalCode: "M5V 3A8",
    headquarters: "CA",
    businessLocation: "CA",
    industry: "Manufacturing",
    yearsInBusiness: 5,
    numberOfEmployees: 15,
    annualRevenue: 500000
  },
  
  // Step 4 - Applicant Details
  step4: {
    applicantFirstName: "John",
    applicantLastName: "TestUser",
    applicantEmail: testEmail,
    applicantPhone: "+14165559999",
    applicantTitle: "CEO",
    applicantAddress: "123 Test Street",
    applicantCity: "Toronto", 
    applicantState: "ON",
    applicantPostalCode: "M5V 3A8"
  }
};

// Create application via API
async function createApplication() {
  try {
    console.log('📤 Creating application via POST /api/public/applications...');
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify({
        form_data: applicationData,
        applicationId: applicationId
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📄 Response Body: ${responseText.substring(0, 200)}...`);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      addResult('Application Creation', true, `ID: ${result.applicationId || applicationId}`);
      return result.applicationId || applicationId;
    } else {
      addResult('Application Creation', false, `Status: ${response.status}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Application creation error:', error);
    addResult('Application Creation', false, error.message);
    return null;
  }
}

// STEP 2: DOCUMENT UPLOAD (Step 5 simulation)
console.log('\n📤 STEP 2: DOCUMENT UPLOAD SIMULATION');

// Create test PDF blobs
function createTestPDF(name, size = 50000) {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${name} - Test Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
279
%%EOF`.padEnd(size, ' ');

  return new Blob([content], { type: 'application/pdf' });
}

const testDocuments = [
  { name: 'Bank_Statement_Nov_2024.pdf', type: 'bank_statements' },
  { name: 'Bank_Statement_Dec_2024.pdf', type: 'bank_statements' },
  { name: 'Bank_Statement_Jan_2025.pdf', type: 'bank_statements' },
  { name: 'Equipment_Quote_2025.pdf', type: 'equipment_quote' },
  { name: 'Financial_Statements_2024.pdf', type: 'financial_statements' },
  { name: 'Business_License_2024.pdf', type: 'business_license' }
];

async function uploadDocuments(appId) {
  const uploadResults = [];
  
  for (let i = 0; i < testDocuments.length; i++) {
    const doc = testDocuments[i];
    
    try {
      console.log(`📤 Uploading ${i + 1}/6: ${doc.name}`);
      
      // Create test PDF
      const file = createTestPDF(doc.name, 25000 + (i * 5000));
      
      // Create FormData
      const formData = new FormData();
      formData.append('document', file, doc.name);
      formData.append('documentType', doc.type);
      
      // Upload via S3 endpoint
      const response = await fetch(`/api/public/upload/${appId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: formData
      });
      
      console.log(`📊 Upload Response: ${response.status} for ${doc.name}`);
      const responseText = await response.text();
      
      if (response.ok) {
        uploadResults.push({ name: doc.name, success: true });
        addResult(`Document Upload ${i + 1}`, true, doc.name);
      } else {
        uploadResults.push({ name: doc.name, success: false, error: responseText });
        addResult(`Document Upload ${i + 1}`, false, `${response.status}: ${doc.name}`);
      }
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Upload error for ${doc.name}:`, error);
      uploadResults.push({ name: doc.name, success: false, error: error.message });
      addResult(`Document Upload ${i + 1}`, false, `${doc.name}: ${error.message}`);
    }
  }
  
  return uploadResults;
}

// STEP 3: APPLICATION FINALIZATION (Step 6 simulation)
console.log('\n🏁 STEP 3: APPLICATION FINALIZATION');

async function finalizeApplication(appId) {
  try {
    console.log('📤 Finalizing application via PATCH /api/public/applications/:id/finalize...');
    
    const response = await fetch(`/api/public/applications/${appId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify({
        typedSignature: "John TestUser",
        agreementTimestamp: new Date().toISOString(),
        ipAddress: "192.168.1.1",
        userAgent: navigator.userAgent
      })
    });
    
    console.log(`📊 Finalization Response: ${response.status}`);
    const responseText = await response.text();
    console.log(`📄 Finalization Body: ${responseText.substring(0, 200)}...`);
    
    if (response.ok) {
      addResult('Application Finalization', true, `Status: ${response.status}`);
      return true;
    } else {
      addResult('Application Finalization', false, `Status: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Finalization error:', error);
    addResult('Application Finalization', false, error.message);
    return false;
  }
}

// STEP 4: STAFF BACKEND VERIFICATION
console.log('\n🔍 STEP 4: STAFF BACKEND VERIFICATION');

async function verifyStaffBackend(appId) {
  try {
    console.log('📤 Checking application in staff backend...');
    
    // Check application exists
    const appResponse = await fetch(`https://staff.boreal.financial/api/applications/${appId}`, {
      headers: {
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      }
    });
    
    console.log(`📊 Staff App Check: ${appResponse.status}`);
    
    if (appResponse.ok) {
      const appData = await appResponse.json();
      addResult('Staff Backend Application', true, `Stage: ${appData.stage || 'Unknown'}`);
      
      // Check documents
      const docsResponse = await fetch(`https://staff.boreal.financial/api/applications/${appId}/documents`, {
        headers: {
          'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });
      
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        const docCount = docsData.documents ? docsData.documents.length : 0;
        addResult('Staff Backend Documents', docCount >= 6, `${docCount} documents found`);
      } else {
        addResult('Staff Backend Documents', false, `Status: ${docsResponse.status}`);
      }
      
      return true;
    } else {
      addResult('Staff Backend Application', false, `Status: ${appResponse.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Staff backend verification error:', error);
    addResult('Staff Backend Application', false, error.message);
    return false;
  }
}

// STEP 5: S3 AUDIT
console.log('\n☁️ STEP 5: S3 INTEGRATION AUDIT');

async function auditS3Integration() {
  try {
    console.log('📤 Running S3 comprehensive audit...');
    
    const response = await fetch('/api/system/test-s3-comprehensive', {
      headers: {
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      }
    });
    
    console.log(`📊 S3 Audit Response: ${response.status}`);
    const responseText = await response.text();
    console.log(`📄 S3 Audit Result: ${responseText.substring(0, 300)}...`);
    
    if (response.ok) {
      addResult('S3 Integration Audit', true, 'Comprehensive test passed');
      return true;
    } else {
      addResult('S3 Integration Audit', false, `Status: ${response.status}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ S3 audit error:', error);
    addResult('S3 Integration Audit', false, error.message);
    return false;
  }
}

// MAIN EXECUTION
async function runFullE2ETest() {
  console.log('\n🚀 STARTING COMPREHENSIVE E2E TEST...');
  
  // Step 1: Create Application
  const createdAppId = await createApplication();
  if (!createdAppId) {
    console.log('\n❌ APPLICATION CREATION FAILED - STOPPING TEST');
    return;
  }
  
  // Step 2: Upload Documents  
  const uploadResults = await uploadDocuments(createdAppId);
  const successfulUploads = uploadResults.filter(r => r.success).length;
  console.log(`📤 Successful Uploads: ${successfulUploads}/6`);
  
  // Step 3: Finalize Application
  const finalized = await finalizeApplication(createdAppId);
  
  // Step 4: Verify Staff Backend
  await verifyStaffBackend(createdAppId);
  
  // Step 5: S3 Audit
  await auditS3Integration();
  
  // FINAL REPORT
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE E2E TEST RESULTS');
  console.log('='.repeat(80));
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`🎯 Overall Pass Rate: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log(`🆔 Final Application ID: ${createdAppId}`);
  console.log(`📤 Documents Uploaded: ${successfulUploads}/6`);
  console.log(`🏁 Application Finalized: ${finalized ? 'YES' : 'NO'}`);
  
  // Individual test results
  console.log('\n📋 DETAILED TEST RESULTS:');
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.testName}${result.details ? ` - ${result.details}` : ''}`);
  });
  
  if (passRate >= 80) {
    console.log('\n🎉 E2E TEST PASSED - APPLICATION WORKFLOW OPERATIONAL');
  } else {
    console.log('\n⚠️ E2E TEST FAILED - REVIEW ISSUES ABOVE');
  }
  
  return {
    applicationId: createdAppId,
    documentsUploaded: successfulUploads,
    finalized: finalized,
    passRate: passRate,
    results: results
  };
}

// Execute test and expose to window for manual execution
window.runFullE2ETest = runFullE2ETest;
console.log('✅ E2E Test ready! Run: window.runFullE2ETest()');

// Auto-execute test
runFullE2ETest().catch(console.error);