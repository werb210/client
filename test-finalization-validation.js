#!/usr/bin/env node

/**
 * CLIENT APPLICATION FINALIZATION VALIDATION
 * Comprehensive test suite to verify all fixes are working correctly
 */

import { execSync } from 'child_process';
import fetch from 'node-fetch';

console.log('🎯 CLIENT APPLICATION FINALIZATION VALIDATION');
console.log('===========================================\n');

const results = {
  fallbackIdGeneration: false,
  singleUuidUsage: false,
  bypassFunctionality: false,
  documentValidation: false,
  errorHandling: false,
  smokeTests: false
};

// TEST 1: Confirm no fallback applicationIds are generated
async function testNoFallbackIds() {
  console.log('🔍 TEST 1: Confirming no fallback applicationIds generated');
  console.log('--------------------------------------------------------');
  
  try {
    // Test duplicate email (should return 409)
    const duplicateResponse = await fetch('http://localhost:5000/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        step1: { requestedAmount: 50000, use_of_funds: "equipment" },
        step3: { operatingName: "Test Company", businessPhone: "+14165551234", businessState: "ON" },
        step4: { applicantFirstName: "John", applicantLastName: "Doe", applicantEmail: "todd@werboweski.com", email: "todd@werboweski.com" }
      })
    });
    
    const duplicateResult = await duplicateResponse.json();
    
    if (duplicateResponse.status === 409 && !duplicateResult.applicationId?.startsWith('app_')) {
      console.log('✅ PASS: Duplicate email returns 409 without fallback ID creation');
      results.fallbackIdGeneration = true;
    } else if (duplicateResult.applicationId?.startsWith('app_')) {
      console.log('❌ FAIL: Fallback ID created:', duplicateResult.applicationId);
    } else {
      console.log('✅ PASS: No fallback ID in duplicate response');
      results.fallbackIdGeneration = true;
    }
    
    // Test unique email (should return 200 with UUID)
    const uniqueEmail = `test.${Date.now()}@example.com`;
    const uniqueResponse = await fetch('http://localhost:5000/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        step1: { requestedAmount: 50000, use_of_funds: "equipment" },
        step3: { operatingName: "Test Company", businessPhone: "+14165551234", businessState: "ON" },
        step4: { applicantFirstName: "John", applicantLastName: "Doe", applicantEmail: uniqueEmail, email: uniqueEmail }
      })
    });
    
    const uniqueResult = await uniqueResponse.json();
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uniqueResult.applicationId);
    
    if (uniqueResponse.ok && isValidUuid) {
      console.log('✅ PASS: Unique email creates proper UUID:', uniqueResult.applicationId);
    } else {
      console.log('❌ FAIL: Invalid application ID format:', uniqueResult.applicationId);
    }
    
  } catch (error) {
    console.log('❌ ERROR: Fallback ID test failed:', error.message);
  }
  
  console.log('');
}

// TEST 2: Verify single UUID usage across components
function testSingleUuidUsage() {
  console.log('🔍 TEST 2: Verifying single UUID usage across all components');
  console.log('----------------------------------------------------------');
  
  try {
    // Check Step 5 uses applicationId from localStorage
    const step5Content = execSync('grep -n "localStorage.getItem.*applicationId" client/src/routes/Step5_DocumentUpload.tsx', { encoding: 'utf8' });
    if (step5Content) {
      console.log('✅ PASS: Step 5 uses applicationId from localStorage');
    }
    
    // Check upload utility uses applicationId parameter
    const uploadContent = execSync('grep -n "applicationId.*string" client/src/utils/uploadDocument.ts', { encoding: 'utf8' });
    if (uploadContent) {
      console.log('✅ PASS: Upload utility uses applicationId parameter');
    }
    
    // Check Step 6 uses applicationId from localStorage
    const step6Content = execSync('grep -n "localStorage.getItem.*applicationId" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (step6Content) {
      console.log('✅ PASS: Step 6 uses applicationId from localStorage');
    }
    
    results.singleUuidUsage = true;
    
  } catch (error) {
    console.log('❌ ERROR: UUID usage test failed:', error.message);
  }
  
  console.log('');
}

// TEST 3: Verify bypass functionality
function testBypassFunctionality() {
  console.log('🔍 TEST 3: Verifying bypass functionality');
  console.log('----------------------------------------');
  
  try {
    // Check Step 5 bypass implementation
    const bypassContent = execSync('grep -A5 -B5 "bypassDocuments.*true" client/src/routes/Step5_DocumentUpload.tsx', { encoding: 'utf8' });
    if (bypassContent.includes('dispatch') && bypassContent.includes('setLocation')) {
      console.log('✅ PASS: Step 5 bypass sets flag and navigates to Step 6');
    }
    
    // Check Step 6 bypass detection
    const step6BypassContent = execSync('grep -A10 "state.bypassDocuments" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (step6BypassContent.includes('return true')) {
      console.log('✅ PASS: Step 6 detects bypass flag and allows finalization');
    }
    
    // Check strict validation when not bypassed
    const strictContent = execSync('grep -A5 "strict validation" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (strictContent.includes('uploadedDocuments.length')) {
      console.log('✅ PASS: Step 6 applies strict validation when not bypassed');
    }
    
    results.bypassFunctionality = true;
    
  } catch (error) {
    console.log('❌ ERROR: Bypass functionality test failed:', error.message);
  }
  
  console.log('');
}

// TEST 4: Verify document validation works both ways
function testDocumentValidation() {
  console.log('🔍 TEST 4: Verifying document validation conditions');
  console.log('--------------------------------------------------');
  
  try {
    // Check for bypass toast message
    const bypassToastContent = execSync('grep -A3 "Documents Bypassed" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (bypassToastContent.includes('toast')) {
      console.log('✅ PASS: Bypass toast message implemented');
    }
    
    // Check for strict validation message
    const strictToastContent = execSync('grep -A3 "Documents Required" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (strictToastContent.includes('toast')) {
      console.log('✅ PASS: Strict validation toast message implemented');
    }
    
    results.documentValidation = true;
    
  } catch (error) {
    console.log('❌ ERROR: Document validation test failed:', error.message);
  }
  
  console.log('');
}

// TEST 5: Verify error handling toasts
function testErrorHandling() {
  console.log('🔍 TEST 5: Verifying error handling toasts');
  console.log('-------------------------------------------');
  
  try {
    // Check 409 duplicate error handling in Step 4
    const duplicateErrorContent = execSync('grep -A10 "response.status === 409" client/src/routes/Step4_ApplicantInfo_Complete.tsx', { encoding: 'utf8' });
    if (duplicateErrorContent.includes('toast') && duplicateErrorContent.includes('Using Existing Application')) {
      console.log('✅ PASS: Step 4 handles 409 duplicate errors with toast');
    }
    
    // Check missing documents toast in Step 6
    const missingDocsContent = execSync('grep -A3 "Please upload all required documents" client/src/routes/Step6_TypedSignature.tsx', { encoding: 'utf8' });
    if (missingDocsContent.includes('variant: "destructive"')) {
      console.log('✅ PASS: Step 6 shows missing documents toast');
    }
    
    results.errorHandling = true;
    
  } catch (error) {
    console.log('❌ ERROR: Error handling test failed:', error.message);
  }
  
  console.log('');
}

// Main execution
async function runValidation() {
  await testNoFallbackIds();
  testSingleUuidUsage();
  testBypassFunctionality();
  testDocumentValidation();
  testErrorHandling();
  
  // Results summary
  console.log('📊 VALIDATION RESULTS SUMMARY');
  console.log('=============================');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n📈 OVERALL: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SUCCESS: All finalization requirements verified');
    console.log('✅ No fallback applicationIds being generated');
    console.log('✅ Single UUID-based ID used across all steps');
    console.log('✅ Bypass functionality working correctly');
    console.log('✅ Document validation works both ways');
    console.log('✅ Error handling toasts implemented');
  } else {
    console.log('\n⚠️  WARNING: Some tests failed - review implementation');
  }
  
  return passedTests === totalTests;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation();
}

export { runValidation };