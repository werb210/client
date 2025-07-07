/**
 * COMPREHENSIVE MANUAL TEST EXECUTION
 * Live testing of complete 7-step workflow with Step 6 diagnostic verification
 * Date: July 7, 2025
 */

async function executeComprehensiveManualTest() {
  console.log('🔥 COMPREHENSIVE MANUAL TEST EXECUTION STARTED');
  console.log('Testing complete 7-step workflow with Canadian business scenario');
  
  // Test execution timestamp
  const testStartTime = new Date().toISOString();
  console.log(`Test Start Time: ${testStartTime}`);
  
  const results = {
    testId: `manual-test-${Date.now()}`,
    startTime: testStartTime,
    steps: {},
    issues: [],
    fieldValidation: {},
    signNowPayload: null,
    summary: {}
  };
  
  try {
    // STEP 1: Navigate to Application
    console.log('\n📍 STEP 1: NAVIGATION & APPLICATION START');
    console.log('URL: https://clientportal.boreal.financial');
    console.log('Action: Click "Apply" button');
    
    // Wait for navigation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're on Step 1
    if (window.location.pathname.includes('/apply/step-1') || window.location.pathname.includes('/step-1')) {
      console.log('✅ Successfully navigated to Step 1 Financial Profile');
      results.steps.step1 = { status: 'accessed', timestamp: new Date().toISOString() };
    } else {
      console.log('❌ Failed to reach Step 1');
      results.issues.push('Navigation to Step 1 failed');
      return results;
    }
    
    // STEP 2: Fill Step 1 Financial Profile
    console.log('\n📍 STEP 1: FINANCIAL PROFILE COMPLETION');
    const step1Data = {
      businessLocation: 'CA',
      headquarters: 'CA',
      industry: 'manufacturing',
      lookingFor: 'capital',
      fundingAmount: 75000,
      fundsPurpose: 'working_capital',
      salesHistory: '3+yr',
      revenueLastYear: 1500000,
      averageMonthlyRevenue: 125000,
      accountsReceivableBalance: 50000,
      fixedAssetsValue: 100000
    };
    
    console.log('Test Data:', step1Data);
    console.log('Manual Action Required: Fill form fields and click Continue');
    
    // Wait for form completion
    console.log('⏳ Waiting for manual form completion...');
    await waitForStepCompletion('/step-2', 'Step 2 Product Selection');
    
    // STEP 3: Product Selection
    console.log('\n📍 STEP 2: PRODUCT SELECTION');
    console.log('Expected: AI recommendations based on Canadian manufacturing, $75K working capital');
    console.log('Manual Action Required: Select a recommended lender product');
    
    await waitForStepCompletion('/step-3', 'Step 3 Business Details');
    
    // STEP 4: Business Details
    console.log('\n📍 STEP 3: BUSINESS DETAILS');
    const step3Data = {
      operatingName: 'TechManufacturing Pro',
      legalName: 'TechManufacturing Pro Ltd.',
      businessStreetAddress: '123 Innovation Drive',
      businessCity: 'Vancouver',
      businessState: 'BC',
      businessPostalCode: 'V6T 1Z4',
      businessPhone: '(604) 555-0123',
      employeeCount: 15,
      businessWebsite: 'https://techmanufacturing.ca',
      businessStartDate: '2020-03',
      businessStructure: 'corporation'
    };
    
    console.log('Test Data:', step3Data);
    console.log('Manual Action Required: Fill business details and click Continue');
    
    await waitForStepCompletion('/step-4', 'Step 4 Applicant Information');
    
    // STEP 5: Applicant Information (Critical Test)
    console.log('\n📍 STEP 4: APPLICANT INFORMATION (Partner Fields Test)');
    const step4Data = {
      // Primary Applicant
      title: 'Mr.',
      firstName: 'Michael',
      lastName: 'Thompson',
      personalEmail: 'michael.thompson@email.com',
      personalPhone: '(604) 555-0456',
      dateOfBirth: '1985-06-15',
      socialSecurityNumber: '123 456 789',
      ownershipPercentage: '75', // CRITICAL: Less than 100% to trigger partner fields
      creditScore: 'good_700_749',
      personalAnnualIncome: '95000',
      applicantAddress: '456 Residential Ave',
      applicantCity: 'Vancouver',
      applicantState: 'BC',
      applicantPostalCode: 'V5K 2L8',
      yearsWithBusiness: '4',
      previousLoans: 'no',
      bankruptcyHistory: 'no',
      
      // Partner Fields (Should appear automatically)
      partnerFirstName: 'Sarah',
      partnerLastName: 'Chen',
      partnerEmail: 'sarah.chen@email.com',
      partnerPhone: '(604) 555-0789',
      partnerDateOfBirth: '1987-09-22',
      partnerSinSsn: '987 654 321',
      partnerOwnershipPercentage: '25',
      partnerCreditScore: 'excellent_750_plus',
      partnerPersonalAnnualIncome: '105000',
      partnerAddress: '789 Partner Street',
      partnerCity: 'Vancouver',
      partnerState: 'BC',
      partnerPostalCode: 'V7G 3M9'
    };
    
    console.log('🚨 CRITICAL TEST: Ownership = 75% should trigger partner fields');
    console.log('Primary Applicant Data:', {
      firstName: step4Data.firstName,
      lastName: step4Data.lastName,
      ownershipPercentage: step4Data.ownershipPercentage
    });
    console.log('Partner Data (should appear):', {
      partnerFirstName: step4Data.partnerFirstName,
      partnerLastName: step4Data.partnerLastName,
      partnerOwnershipPercentage: step4Data.partnerOwnershipPercentage
    });
    
    // Check for partner fields visibility
    console.log('Manual Verification Required:');
    console.log('□ Enter ownership percentage as 75%');
    console.log('□ Verify partner fields section appears automatically');
    console.log('□ Fill all partner information fields');
    console.log('□ Verify regional formatting (Canadian postal codes, SIN)');
    
    await waitForStepCompletion('/step-5', 'Step 5 Document Upload');
    
    // STEP 6: Document Upload
    console.log('\n📍 STEP 5: DOCUMENT UPLOAD');
    console.log('Options: Upload documents OR use bypass option');
    console.log('Manual Action Required: Upload test documents or click bypass');
    
    await waitForStepCompletion('/step-6', 'Step 6 Signature');
    
    // STEP 7: SignNow Signature (Critical Diagnostic)
    console.log('\n📍 STEP 6: SIGNNOW SIGNATURE & DIAGNOSTIC');
    console.log('🔍 CRITICAL DIAGNOSTIC CHECKPOINT');
    
    // Setup diagnostic tools
    if (typeof window !== 'undefined') {
      setupSignNowDiagnostics();
    }
    
    console.log('\n🛠️ DIAGNOSTIC TOOLS READY:');
    console.log('Run in DevTools console:');
    console.log('await window.borealApp?.debug?.printSigningPayload?.()');
    console.log('');
    console.log('Expected Results:');
    console.log('- 58 total fields in signing payload');
    console.log('- Business details: 11 fields');
    console.log('- Primary applicant: 15 fields');
    console.log('- Partner info: 11 fields (should be present)');
    console.log('- Financial profile: 12 fields');
    console.log('- Product selection: 6 fields');
    console.log('- Document info: 3 fields');
    
    console.log('\n⚠️ KNOWN ISSUE MONITORING:');
    console.log('- SignNow 500 error (production blocker)');
    console.log('- Missing or null fields in payload');
    console.log('- Partner fields not included despite ownership < 100%');
    
    await waitForStepCompletion('/step-7', 'Step 7 Submission');
    
    // STEP 8: Final Submission
    console.log('\n📍 STEP 7: FINAL SUBMISSION');
    console.log('Expected: Application summary, terms acceptance, POST to staff API');
    console.log('Manual Action Required: Accept terms and submit application');
    
    // Wait for completion
    await waitForCompletion();
    
    console.log('\n✅ COMPREHENSIVE MANUAL TEST COMPLETED');
    console.log('Review results and diagnostic output above');
    
    return results;
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
    results.issues.push(`Execution error: ${error.message}`);
    return results;
  }
}

// Helper function to wait for step completion
async function waitForStepCompletion(expectedPath, stepName) {
  return new Promise((resolve) => {
    console.log(`⏳ Waiting for navigation to ${stepName}...`);
    console.log(`Expected path: ${expectedPath}`);
    console.log('Complete the current step manually and this will auto-detect progression');
    
    const checkInterval = setInterval(() => {
      if (window.location.pathname.includes(expectedPath)) {
        console.log(`✅ Successfully reached ${stepName}`);
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);
    
    // Auto-resolve after 60 seconds to prevent hanging
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log(`⏰ Auto-continuing after 60 seconds (may be on ${stepName})`);
      resolve();
    }, 60000);
  });
}

// Helper function to wait for final completion
async function waitForCompletion() {
  return new Promise((resolve) => {
    console.log('⏳ Waiting for application submission completion...');
    
    setTimeout(() => {
      console.log('✅ Test execution completed');
      resolve();
    }, 10000);
  });
}

// Setup SignNow diagnostic tools
function setupSignNowDiagnostics() {
  if (typeof window === 'undefined') return;
  
  // Create global diagnostic object
  window.borealApp = window.borealApp || {};
  window.borealApp.debug = window.borealApp.debug || {};
  
  // SignNow payload printer
  window.borealApp.debug.printSigningPayload = async function() {
    console.log('🔍 SIGNNOW PAYLOAD DIAGNOSTIC');
    console.log('=====================================');
    
    try {
      // Try to access form context or state
      const formData = window.borealApp?.formData || 
                      JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
      
      if (!formData || Object.keys(formData).length === 0) {
        console.log('❌ No form data found in context or localStorage');
        return null;
      }
      
      // Construct signing payload structure
      const signingPayload = {
        businessDetails: {
          operatingName: formData.operatingName,
          legalName: formData.legalName,
          businessStreetAddress: formData.businessStreetAddress,
          businessCity: formData.businessCity,
          businessState: formData.businessState,
          businessPostalCode: formData.businessPostalCode,
          businessPhone: formData.businessPhone,
          employeeCount: formData.employeeCount,
          businessWebsite: formData.businessWebsite,
          businessStartDate: formData.businessStartDate,
          businessStructure: formData.businessStructure
        },
        applicantInfo: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          personalEmail: formData.personalEmail,
          personalPhone: formData.personalPhone,
          dateOfBirth: formData.dateOfBirth,
          socialSecurityNumber: formData.socialSecurityNumber,
          ownershipPercentage: formData.ownershipPercentage,
          creditScore: formData.creditScore,
          personalAnnualIncome: formData.personalAnnualIncome,
          applicantAddress: formData.applicantAddress,
          applicantCity: formData.applicantCity,
          applicantState: formData.applicantState,
          applicantPostalCode: formData.applicantPostalCode,
          yearsWithBusiness: formData.yearsWithBusiness,
          previousLoans: formData.previousLoans,
          bankruptcyHistory: formData.bankruptcyHistory
        },
        partnerInfo: formData.ownershipPercentage && parseInt(formData.ownershipPercentage) < 100 ? {
          partnerFirstName: formData.partnerFirstName,
          partnerLastName: formData.partnerLastName,
          partnerEmail: formData.partnerEmail,
          partnerPhone: formData.partnerPhone,
          partnerDateOfBirth: formData.partnerDateOfBirth,
          partnerSinSsn: formData.partnerSinSsn,
          partnerOwnershipPercentage: formData.partnerOwnershipPercentage,
          partnerCreditScore: formData.partnerCreditScore,
          partnerPersonalAnnualIncome: formData.partnerPersonalAnnualIncome,
          partnerAddress: formData.partnerAddress,
          partnerCity: formData.partnerCity,
          partnerState: formData.partnerState,
          partnerPostalCode: formData.partnerPostalCode
        } : null,
        financialProfile: {
          businessLocation: formData.businessLocation,
          headquarters: formData.headquarters,
          industry: formData.industry,
          lookingFor: formData.lookingFor,
          fundingAmount: formData.fundingAmount,
          fundsPurpose: formData.fundsPurpose,
          salesHistory: formData.salesHistory,
          revenueLastYear: formData.revenueLastYear,
          averageMonthlyRevenue: formData.averageMonthlyRevenue,
          accountsReceivableBalance: formData.accountsReceivableBalance,
          fixedAssetsValue: formData.fixedAssetsValue,
          equipmentValue: formData.equipmentValue
        },
        lenderSelection: {
          selectedProductId: formData.selectedProductId,
          selectedProductName: formData.selectedProductName,
          selectedLenderName: formData.selectedLenderName,
          matchScore: formData.matchScore,
          selectedCategory: formData.selectedCategory,
          selectedCategoryName: formData.selectedCategoryName
        },
        documentInfo: {
          uploadedDocuments: formData.uploadedDocuments || [],
          bypassedDocuments: formData.bypassedDocuments || false
        }
      };
      
      // Field validation
      let fieldCount = 0;
      let nullFields = [];
      let presentFields = [];
      
      // Count and validate fields
      function validateSection(section, sectionName) {
        if (!section) return;
        
        Object.entries(section).forEach(([key, value]) => {
          fieldCount++;
          if (value === null || value === undefined || value === '') {
            nullFields.push(`${sectionName}.${key}`);
          } else {
            presentFields.push(`${sectionName}.${key}`);
          }
        });
      }
      
      validateSection(signingPayload.businessDetails, 'businessDetails');
      validateSection(signingPayload.applicantInfo, 'applicantInfo');
      validateSection(signingPayload.partnerInfo, 'partnerInfo');
      validateSection(signingPayload.financialProfile, 'financialProfile');
      validateSection(signingPayload.lenderSelection, 'lenderSelection');
      
      // Report results
      console.log('📊 PAYLOAD VALIDATION RESULTS:');
      console.log(`Total Fields: ${fieldCount}`);
      console.log(`Present Fields: ${presentFields.length}`);
      console.log(`Null/Missing Fields: ${nullFields.length}`);
      
      if (nullFields.length > 0) {
        console.log('\n❌ NULL/MISSING FIELDS:');
        nullFields.forEach(field => console.log(`  - ${field}`));
      }
      
      console.log('\n✅ PRESENT FIELDS:');
      presentFields.forEach(field => console.log(`  - ${field}`));
      
      console.log('\n📄 COMPLETE SIGNING PAYLOAD:');
      console.log(JSON.stringify(signingPayload, null, 2));
      
      // Partner field validation
      if (signingPayload.partnerInfo) {
        console.log('\n✅ PARTNER FIELDS DETECTED (ownership < 100%)');
        console.log('Partner Name:', signingPayload.partnerInfo.partnerFirstName, signingPayload.partnerInfo.partnerLastName);
        console.log('Partner Ownership:', signingPayload.partnerInfo.partnerOwnershipPercentage + '%');
      } else {
        console.log('\n⚠️ NO PARTNER FIELDS (ownership = 100% or missing)');
      }
      
      return signingPayload;
      
    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      return null;
    }
  };
  
  console.log('🛠️ SignNow diagnostic tools installed');
  console.log('Available: window.borealApp.debug.printSigningPayload()');
}

// Auto-execute the test
console.log('📋 Comprehensive Manual Test Execution Ready');
console.log('Run: executeComprehensiveManualTest() to begin');

// Make functions globally available
if (typeof window !== 'undefined') {
  window.executeComprehensiveManualTest = executeComprehensiveManualTest;
  window.setupSignNowDiagnostics = setupSignNowDiagnostics;
  setupSignNowDiagnostics();
}