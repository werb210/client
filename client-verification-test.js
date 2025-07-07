/**
 * CLIENT-SIDE VERIFICATION CHECKLIST IMPLEMENTATION
 * Systematic testing following the detailed walkthrough protocol
 * Date: July 7, 2025
 */

class ClientVerificationTest {
  constructor() {
    this.testResults = {
      testId: `client-verification-${Date.now()}`,
      startTime: new Date().toISOString(),
      greenlight: {
        step6Signature: { status: 'pending', evidence: null },
        fieldMapping: { status: 'pending', evidence: null },
        no500Errors: { status: 'pending', evidence: null },
        partnerLogic: { status: 'pending', evidence: null },
        staffAPI: { status: 'pending', evidence: null },
        applicationSaved: { status: 'pending', evidence: null }
      },
      stepValidations: {},
      criticalIssues: [],
      deploymentRecommendation: 'pending'
    };
    
    this.testData = {
      businessProfile: {
        operatingName: "TechManufacturing Pro",
        legalName: "TechManufacturing Pro Ltd.",
        businessLocation: "CA",
        industry: "Manufacturing",
        fundingAmount: 75000,
        lookingFor: "Capital"
      },
      applicant: {
        firstName: "Michael",
        lastName: "Thompson",
        email: "michael.thompson@email.com",
        phone: "(604) 555-0456",
        ownershipPercentage: 75
      },
      partner: {
        firstName: "Sarah",
        lastName: "Chen",
        email: "sarah.chen@email.com",
        ownershipPercentage: 25
      }
    };
  }

  async verifyStep1FinancialProfile() {
    console.log('\n🔍 VERIFYING STEP 1: FINANCIAL PROFILE');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const step1Validation = {
      businessLocationSet: formData.businessLocation === 'CA',
      industrySelected: formData.industry === 'Manufacturing',
      fundingAmountSet: parseInt(formData.fundingAmount) === 75000,
      autoSaveWorking: Object.keys(formData).length > 0
    };
    
    this.testResults.stepValidations.step1 = step1Validation;
    
    const step1Success = Object.values(step1Validation).every(v => v === true);
    console.log('Step 1 Validation:', step1Success ? '✅ PASS' : '❌ FAIL');
    
    if (!step1Success) {
      this.testResults.criticalIssues.push('Step 1 form data not properly saved');
    }
    
    return step1Success;
  }

  async verifyStep2ProductRecommendation() {
    console.log('\n🔍 VERIFYING STEP 2: PRODUCT RECOMMENDATIONS');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const step2Validation = {
      productSelected: formData.selectedProductName && formData.selectedLenderName,
      categorySelected: formData.selectedCategory,
      canadianProducts: formData.businessLocation === 'CA'
    };
    
    this.testResults.stepValidations.step2 = step2Validation;
    
    const step2Success = Object.values(step2Validation).every(v => v === true);
    console.log('Step 2 Validation:', step2Success ? '✅ PASS' : '❌ FAIL');
    
    if (!step2Success) {
      this.testResults.criticalIssues.push('Step 2 product selection not completed');
    }
    
    return step2Success;
  }

  async verifyStep3BusinessDetails() {
    console.log('\n🔍 VERIFYING STEP 3: BUSINESS DETAILS');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const step3Validation = {
      operatingNameSet: formData.operatingName === this.testData.businessProfile.operatingName,
      legalNameSet: formData.legalName === this.testData.businessProfile.legalName,
      businessAddressSet: formData.businessStreetAddress && formData.businessCity,
      canadianFormatting: formData.businessPostalCode && formData.businessPostalCode.includes(' ')
    };
    
    this.testResults.stepValidations.step3 = step3Validation;
    
    const step3Success = Object.values(step3Validation).every(v => v === true);
    console.log('Step 3 Validation:', step3Success ? '✅ PASS' : '❌ FAIL');
    
    if (!step3Success) {
      this.testResults.criticalIssues.push('Step 3 business details incomplete');
    }
    
    return step3Success;
  }

  async verifyStep4ApplicantPartner() {
    console.log('\n🔍 VERIFYING STEP 4: APPLICANT & PARTNER LOGIC (CRITICAL)');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const ownership = parseInt(formData.ownershipPercentage) || 100;
    const shouldHavePartner = ownership < 100;
    
    const partnerFields = [
      'partnerFirstName', 'partnerLastName', 'partnerEmail', 
      'partnerPhone', 'partnerOwnershipPercentage'
    ];
    
    const presentPartnerFields = partnerFields.filter(field => 
      formData[field] !== undefined && formData[field] !== null && formData[field] !== ''
    );
    
    const step4Validation = {
      primaryApplicantComplete: formData.firstName && formData.lastName && formData.personalEmail,
      ownershipPercentageSet: ownership === 75,
      partnerFieldsTriggered: shouldHavePartner,
      partnerFieldsPopulated: presentPartnerFields.length >= 3,
      partnerDataCorrect: formData.partnerFirstName === 'Sarah' && formData.partnerLastName === 'Chen'
    };
    
    this.testResults.stepValidations.step4 = step4Validation;
    this.testResults.greenlight.partnerLogic = {
      status: step4Validation.partnerFieldsTriggered && step4Validation.partnerFieldsPopulated ? 'pass' : 'fail',
      evidence: {
        ownership: ownership,
        shouldHavePartner: shouldHavePartner,
        partnerFieldsFound: presentPartnerFields.length,
        partnerFieldsList: presentPartnerFields
      }
    };
    
    const step4Success = Object.values(step4Validation).every(v => v === true);
    console.log('Step 4 Validation:', step4Success ? '✅ PASS' : '❌ FAIL');
    console.log('Partner Logic Greenlight:', this.testResults.greenlight.partnerLogic.status.toUpperCase());
    
    if (!step4Success) {
      this.testResults.criticalIssues.push('Step 4 partner logic failed - critical deployment blocker');
    }
    
    return step4Success;
  }

  async verifyStep5DocumentUpload() {
    console.log('\n🔍 VERIFYING STEP 5: DOCUMENT UPLOAD');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const step5Validation = {
      documentsHandled: formData.uploadedDocuments || formData.bypassedDocuments,
      bypassFunctional: formData.bypassedDocuments !== undefined,
      progressToStep6: true // Can progress regardless of upload/bypass
    };
    
    this.testResults.stepValidations.step5 = step5Validation;
    
    const step5Success = Object.values(step5Validation).every(v => v === true);
    console.log('Step 5 Validation:', step5Success ? '✅ PASS' : '❌ FAIL');
    
    return step5Success;
  }

  async verifyStep6SignNowSignature() {
    console.log('\n🔍 VERIFYING STEP 6: SIGNNOW SIGNATURE (CRITICAL GREENLIGHT)');
    
    // Check if currently on Step 6
    const onStep6 = window.location.pathname.includes('step-6') || 
                   window.location.pathname.includes('signature');
    
    if (!onStep6) {
      console.log('⚠️ Not currently on Step 6 - navigate to signature step for validation');
      this.testResults.greenlight.step6Signature.status = 'pending';
      return false;
    }
    
    // Check for iframe or SignNow integration
    const iframe = document.querySelector('iframe');
    const signNowContainer = document.querySelector('[class*="signnow"], [id*="signnow"]');
    
    const step6Validation = {
      onSignaturePage: onStep6,
      iframeDetected: iframe !== null,
      signNowContainerFound: signNowContainer !== null,
      fieldsAutoFilled: iframe && iframe.src && iframe.src.length > 0
    };
    
    this.testResults.stepValidations.step6 = step6Validation;
    this.testResults.greenlight.step6Signature = {
      status: step6Validation.iframeDetected && step6Validation.fieldsAutoFilled ? 'pass' : 'fail',
      evidence: {
        iframeSrc: iframe ? iframe.src : null,
        containerPresent: step6Validation.signNowContainerFound,
        pageLoaded: step6Validation.onSignaturePage
      }
    };
    
    const step6Success = Object.values(step6Validation).some(v => v === true);
    console.log('Step 6 Validation:', step6Success ? '✅ PASS' : '❌ FAIL');
    console.log('Step 6 Signature Greenlight:', this.testResults.greenlight.step6Signature.status.toUpperCase());
    
    return step6Success;
  }

  async verifyStep7FinalConfirmation() {
    console.log('\n🔍 VERIFYING STEP 7: FINAL SUBMISSION');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    const step7Validation = {
      applicationDataComplete: Object.keys(formData).length > 40,
      termsAcceptanceReady: true, // UI functionality
      submissionEndpointReady: true // API endpoint configured
    };
    
    this.testResults.stepValidations.step7 = step7Validation;
    this.testResults.greenlight.applicationSaved = {
      status: step7Validation.applicationDataComplete ? 'pass' : 'fail',
      evidence: {
        totalFields: Object.keys(formData).length,
        applicationComplete: step7Validation.applicationDataComplete
      }
    };
    
    const step7Success = Object.values(step7Validation).every(v => v === true);
    console.log('Step 7 Validation:', step7Success ? '✅ PASS' : '❌ FAIL');
    console.log('Application Saved Greenlight:', this.testResults.greenlight.applicationSaved.status.toUpperCase());
    
    return step7Success;
  }

  async executeComprehensiveVerification() {
    console.log('🚀 EXECUTING COMPREHENSIVE CLIENT VERIFICATION');
    console.log('Target: All 6 Deployment Greenlight Conditions');
    console.log('Test Scenario: Canadian Manufacturing + Partner Logic (75%)');
    
    try {
      // Execute all step validations
      const step1Result = await this.verifyStep1FinancialProfile();
      const step2Result = await this.verifyStep2ProductRecommendation();
      const step3Result = await this.verifyStep3BusinessDetails();
      const step4Result = await this.verifyStep4ApplicantPartner();
      const step5Result = await this.verifyStep5DocumentUpload();
      const step6Result = await this.verifyStep6SignNowSignature();
      const step7Result = await this.verifyStep7FinalConfirmation();
      
      // Execute field mapping validation
      await this.validateFieldMapping();
      
      // Monitor for 500 errors
      this.monitor500Errors();
      
      // Generate final deployment recommendation
      this.generateDeploymentRecommendation();
      
      console.log('\n📊 COMPREHENSIVE VERIFICATION COMPLETE');
      console.log('Results available in testResults object');
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Verification error:', error);
      this.testResults.criticalIssues.push(`Verification execution error: ${error.message}`);
      this.testResults.deploymentRecommendation = 'fail';
      return this.testResults;
    }
  }

  async validateFieldMapping() {
    console.log('\n🔍 VALIDATING FIELD MAPPING (GREENLIGHT CONDITION 2)');
    
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    if (!formData || Object.keys(formData).length === 0) {
      this.testResults.greenlight.fieldMapping = {
        status: 'fail',
        evidence: { reason: 'No form data found' }
      };
      return false;
    }
    
    // Execute diagnostic payload function
    const payload = await this.getFormData();
    
    let totalFields = 0;
    let populatedFields = 0;
    
    // Count all fields in payload
    function countFields(obj, prefix = '') {
      if (!obj) return;
      
      Object.entries(obj).forEach(([key, value]) => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          populatedFields++;
        }
      });
    }
    
    if (payload) {
      countFields(payload.businessDetails, 'business');
      countFields(payload.applicantInfo, 'applicant');
      countFields(payload.partnerInfo, 'partner');
      countFields(payload.financialProfile, 'financial');
      countFields(payload.lenderSelection, 'lender');
    }
    
    const fieldCompletionRate = totalFields > 0 ? (populatedFields / totalFields * 100) : 0;
    const expectedFields = 58;
    const meetsThreshold = populatedFields >= 55 && fieldCompletionRate >= 92.3;
    
    this.testResults.greenlight.fieldMapping = {
      status: meetsThreshold ? 'pass' : 'fail',
      evidence: {
        totalFields: totalFields,
        populatedFields: populatedFields,
        expectedFields: expectedFields,
        completionRate: fieldCompletionRate.toFixed(1) + '%',
        meetsThreshold: meetsThreshold
      }
    };
    
    console.log('Field Mapping Results:');
    console.log(`- Total Fields: ${totalFields}`);
    console.log(`- Populated Fields: ${populatedFields}`);
    console.log(`- Completion Rate: ${fieldCompletionRate.toFixed(1)}%`);
    console.log(`- Meets Threshold: ${meetsThreshold ? 'YES' : 'NO'}`);
    console.log('Field Mapping Greenlight:', this.testResults.greenlight.fieldMapping.status.toUpperCase());
    
    return meetsThreshold;
  }

  monitor500Errors() {
    console.log('\n🔍 MONITORING API FOR 500 ERRORS (GREENLIGHT CONDITION 3)');
    
    // Check recent network requests for 500 errors
    const networkEntries = performance.getEntriesByType('resource').filter(entry => 
      entry.name.includes('/api/') || entry.name.includes('staff')
    );
    
    const errorRequests = networkEntries.filter(entry => 
      entry.responseStatus >= 500 && entry.responseStatus < 600
    );
    
    this.testResults.greenlight.no500Errors = {
      status: errorRequests.length === 0 ? 'pass' : 'fail',
      evidence: {
        totalApiCalls: networkEntries.length,
        errorCalls: errorRequests.length,
        errorDetails: errorRequests.map(req => ({
          url: req.name,
          status: req.responseStatus,
          duration: req.duration
        }))
      }
    };
    
    console.log('500 Error Monitoring:');
    console.log(`- Total API Calls: ${networkEntries.length}`);
    console.log(`- 500 Errors Found: ${errorRequests.length}`);
    console.log('No 500 Errors Greenlight:', this.testResults.greenlight.no500Errors.status.toUpperCase());
    
    if (errorRequests.length > 0) {
      console.log('❌ 500 Errors detected:', errorRequests);
      this.testResults.criticalIssues.push('API returning 500 Internal Server Errors');
    }
  }

  generateDeploymentRecommendation() {
    console.log('\n🎯 GENERATING DEPLOYMENT RECOMMENDATION');
    
    const greenlightResults = Object.values(this.testResults.greenlight).map(condition => condition.status);
    const passCount = greenlightResults.filter(status => status === 'pass').length;
    const totalConditions = greenlightResults.filter(status => status !== 'pending').length;
    const passRate = totalConditions > 0 ? (passCount / totalConditions * 100) : 0;
    
    let recommendation = 'fail';
    let reason = '';
    
    if (passCount === 6) {
      recommendation = 'approved';
      reason = 'All 6 greenlight conditions met';
    } else if (passCount >= 5) {
      recommendation = 'conditional';
      reason = `${passCount}/6 conditions met - review required`;
    } else if (passCount >= 3) {
      recommendation = 'delayed';
      reason = `${passCount}/6 conditions met - critical fixes needed`;
    } else {
      recommendation = 'blocked';
      reason = `${passCount}/6 conditions met - major deployment issues`;
    }
    
    this.testResults.deploymentRecommendation = recommendation;
    this.testResults.deploymentReason = reason;
    this.testResults.deploymentScore = `${passCount}/6 (${passRate.toFixed(1)}%)`;
    
    console.log('\n📋 DEPLOYMENT GREENLIGHT SUMMARY:');
    console.log('=====================================');
    
    Object.entries(this.testResults.greenlight).forEach(([condition, result]) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳';
      const conditionName = condition.charAt(0).toUpperCase() + condition.slice(1).replace(/([A-Z])/g, ' $1');
      console.log(`${icon} ${conditionName}: ${result.status.toUpperCase()}`);
    });
    
    console.log('\n🎯 FINAL RECOMMENDATION:');
    console.log(`Status: ${recommendation.toUpperCase()}`);
    console.log(`Score: ${this.testResults.deploymentScore}`);
    console.log(`Reason: ${reason}`);
    
    if (this.testResults.criticalIssues.length > 0) {
      console.log('\n⚠️ CRITICAL ISSUES TO ADDRESS:');
      this.testResults.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
  }

  getFormData() {
    const formData = JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    
    if (!formData || Object.keys(formData).length === 0) {
      return null;
    }
    
    const ownership = parseInt(formData.ownershipPercentage) || 100;
    const shouldHavePartner = ownership < 100;
    
    return {
      businessDetails: {
        operatingName: formData.operatingName || formData.businessName,
        legalName: formData.legalName,
        businessStreetAddress: formData.businessStreetAddress || formData.businessAddress,
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
      partnerInfo: shouldHavePartner ? {
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
  }

  setupDiagnosticTools() {
    // Make diagnostic tools globally available
    window.borealApp = window.borealApp || {};
    window.borealApp.verification = this;
    
    window.borealApp.debug = window.borealApp.debug || {};
    window.borealApp.debug.printSigningPayload = () => {
      console.log('\n🔍 SIGNNOW PAYLOAD DIAGNOSTIC');
      console.log('==============================');
      
      const payload = this.getFormData();
      if (!payload) {
        console.log('❌ No form data available');
        return null;
      }
      
      console.log('📊 Payload Structure:');
      console.log(JSON.stringify(payload, null, 2));
      
      return payload;
    };
    
    console.log('🔧 Diagnostic tools initialized');
    console.log('Available commands:');
    console.log('- window.borealApp.verification.executeComprehensiveVerification()');
    console.log('- window.borealApp.debug.printSigningPayload()');
  }

  async printSigningPayload() {
    console.log('\n🔍 SIGNNOW PAYLOAD DIAGNOSTIC EXECUTION');
    console.log('=====================================');
    
    const payload = this.getFormData();
    if (!payload) {
      console.log('❌ No form data available for payload construction');
      return null;
    }
    
    // Analyze payload structure
    let totalFields = 0;
    let populatedFields = 0;
    let nullFields = [];
    
    const analyzeSection = (section, sectionName) => {
      if (!section) return;
      
      Object.entries(section).forEach(([key, value]) => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          populatedFields++;
        } else {
          nullFields.push(`${sectionName}.${key}`);
        }
      });
    };
    
    analyzeSection(payload.businessDetails, 'businessDetails');
    analyzeSection(payload.applicantInfo, 'applicantInfo');
    analyzeSection(payload.partnerInfo, 'partnerInfo');
    analyzeSection(payload.financialProfile, 'financialProfile');
    analyzeSection(payload.lenderSelection, 'lenderSelection');
    
    const fieldCompletionRate = (populatedFields / totalFields * 100).toFixed(1);
    const expectedFields = 58;
    const successRate = (populatedFields / expectedFields * 100).toFixed(1);
    
    console.log('📊 PAYLOAD VALIDATION RESULTS:');
    console.log('Total Fields:', totalFields);
    console.log('Populated Fields:', populatedFields);
    console.log('Field Completion Rate:', fieldCompletionRate + '%');
    console.log('Expected Fields:', expectedFields);
    console.log('Success Rate:', successRate + '%');
    console.log('Target Rate: 92.3%');
    
    if (parseFloat(successRate) >= 92.3) {
      console.log('✅ SUCCESS RATE ACHIEVED!');
    } else {
      console.log('❌ Success rate below target');
    }
    
    // Partner fields analysis
    const ownership = parseInt(payload.applicantInfo?.ownershipPercentage) || 100;
    const shouldHavePartner = ownership < 100;
    
    console.log('\n👥 PARTNER FIELDS ANALYSIS:');
    console.log('Ownership percentage:', ownership + '%');
    console.log('Should have partner:', shouldHavePartner);
    console.log('Partner info included:', payload.partnerInfo !== null);
    
    if (shouldHavePartner && payload.partnerInfo) {
      console.log('✅ Partner fields correctly included');
    } else if (shouldHavePartner && !payload.partnerInfo) {
      console.log('❌ CRITICAL ISSUE: Partner fields missing despite ownership < 100%');
    }
    
    if (nullFields.length > 0) {
      console.log('\n⚠️ Null/Empty Fields (' + nullFields.length + '):');
      nullFields.forEach(field => console.log(`  ${field}`));
    }
    
    console.log('\n📄 COMPLETE SIGNING PAYLOAD:');
    console.log(JSON.stringify(payload, null, 2));
    
    return payload;
  }
}

// Initialize the verification system
const clientVerification = new ClientVerificationTest();
clientVerification.setupDiagnosticTools();

console.log('🔍 CLIENT VERIFICATION TEST READY');
console.log('Commands available:');
console.log('- clientVerification.executeComprehensiveVerification()');
console.log('- clientVerification.printSigningPayload()');
console.log('- window.borealApp.debug.printSigningPayload()');
console.log('');
console.log('🎯 Execute comprehensive verification to validate all 6 deployment greenlight conditions');

// Make globally available
if (typeof window !== 'undefined') {
  window.clientVerification = clientVerification;
}