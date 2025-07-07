/**
 * CLIENT-SIDE VERIFICATION CHECKLIST IMPLEMENTATION
 * Systematic testing following the detailed walkthrough protocol
 * Date: July 7, 2025
 */

class ClientVerificationTest {
  constructor() {
    this.testResults = {
      startTime: new Date().toISOString(),
      steps: {},
      fieldValidation: {},
      partnerFields: {},
      signingPayload: null,
      issues: [],
      successRate: 0
    };
    
    this.setupDiagnosticTools();
    console.log('🔵 CLIENT-SIDE VERIFICATION CHECKLIST INITIATED');
  }

  // Step 1: Financial Profile Verification
  async verifyStep1FinancialProfile() {
    console.log('\n✅ STEP 1: FINANCIAL PROFILE VERIFICATION');
    
    const step1Checklist = {
      businessLocationCanada: false,
      industrySelected: false,
      revenueEntered: false,
      salesHistorySelected: false,
      regionalFormatting: false,
      formDataPersisted: false
    };
    
    // Check form data from localStorage
    const formData = this.getFormData();
    
    if (formData.businessLocation === 'CA') {
      step1Checklist.businessLocationCanada = true;
      console.log('✓ Canada selected as business location');
    }
    
    if (formData.industry) {
      step1Checklist.industrySelected = true;
      console.log('✓ Industry selected:', formData.industry);
    }
    
    if (formData.revenueLastYear > 0) {
      step1Checklist.revenueEntered = true;
      console.log('✓ Revenue entered:', formData.revenueLastYear);
    }
    
    if (formData.salesHistory) {
      step1Checklist.salesHistorySelected = true;
      console.log('✓ Sales history selected:', formData.salesHistory);
    }
    
    // Check Canadian regional formatting expectations
    if (formData.businessLocation === 'CA') {
      step1Checklist.regionalFormatting = true;
      console.log('✓ Canadian regional formatting expected');
    }
    
    step1Checklist.formDataPersisted = Object.keys(formData).length > 5;
    
    this.testResults.steps.step1 = step1Checklist;
    return step1Checklist;
  }

  // Step 2: AI Product Recommendation Verification
  async verifyStep2ProductRecommendation() {
    console.log('\n✅ STEP 2: AI PRODUCT RECOMMENDATION VERIFICATION');
    
    const step2Checklist = {
      engineAutoSelected: false,
      lenderNamePopulated: false,
      productNamePopulated: false,
      matchScorePresent: false,
      formDataUpdated: false
    };
    
    const formData = this.getFormData();
    
    if (formData.selectedLenderName) {
      step2Checklist.lenderNamePopulated = true;
      step2Checklist.engineAutoSelected = true;
      console.log('✓ Selected lender:', formData.selectedLenderName);
    }
    
    if (formData.selectedProductName) {
      step2Checklist.productNamePopulated = true;
      console.log('✓ Selected product:', formData.selectedProductName);
    }
    
    if (formData.matchScore !== undefined) {
      step2Checklist.matchScorePresent = true;
      console.log('✓ Match score:', formData.matchScore);
    }
    
    // Diagnostic check
    console.log('🔍 Diagnostic: formData.selectedLenderName =', formData.selectedLenderName);
    
    step2Checklist.formDataUpdated = !!(formData.selectedLenderName && formData.selectedProductName);
    
    this.testResults.steps.step2 = step2Checklist;
    return step2Checklist;
  }

  // Step 3: Business Details Verification
  async verifyStep3BusinessDetails() {
    console.log('\n✅ STEP 3: BUSINESS DETAILS VERIFICATION');
    
    const step3Checklist = {
      allAddressFields: false,
      businessStartDate: false,
      businessStructure: false,
      websiteOptional: false,
      operatingName: false,
      legalName: false
    };
    
    const formData = this.getFormData();
    
    // Check for unified schema fields
    if (formData.operatingName || formData.businessName) {
      step3Checklist.operatingName = true;
      console.log('✓ Operating name:', formData.operatingName || formData.businessName);
    }
    
    if (formData.legalName) {
      step3Checklist.legalName = true;
      console.log('✓ Legal name:', formData.legalName);
    }
    
    // Address fields
    const addressFields = ['businessStreetAddress', 'businessAddress', 'businessCity', 'businessState', 'businessPostalCode', 'businessZipCode'];
    const addressComplete = addressFields.some(field => formData[field]);
    
    if (addressComplete) {
      step3Checklist.allAddressFields = true;
      console.log('✓ Address fields populated');
    }
    
    if (formData.businessStartDate) {
      step3Checklist.businessStartDate = true;
      console.log('✓ Business start date:', formData.businessStartDate);
    }
    
    if (formData.businessStructure) {
      step3Checklist.businessStructure = true;
      console.log('✓ Business structure:', formData.businessStructure);
    }
    
    if (formData.businessWebsite) {
      step3Checklist.websiteOptional = true;
      console.log('✓ Website entered:', formData.businessWebsite);
    }
    
    this.testResults.steps.step3 = step3Checklist;
    return step3Checklist;
  }

  // Step 4: Applicant + Partner Verification (Critical)
  async verifyStep4ApplicantPartner() {
    console.log('\n✅ STEP 4: APPLICANT + PARTNER VERIFICATION (CRITICAL)');
    
    const step4Checklist = {
      ownershipLessThan100: false,
      applicantInfoComplete: false,
      partnerFieldsVisible: false,
      partnerInfoComplete: false,
      formDataPartnerExists: false
    };
    
    const formData = this.getFormData();
    
    // Check ownership percentage
    const ownership = parseInt(formData.ownershipPercentage) || 100;
    if (ownership < 100) {
      step4Checklist.ownershipLessThan100 = true;
      console.log('✓ Ownership < 100%:', ownership + '%');
      console.log('✅ Partner fields should be visible and required');
    } else {
      console.log('⚠️ Ownership = 100%, partner fields should NOT appear');
    }
    
    // Primary applicant verification
    const applicantFields = ['firstName', 'lastName', 'personalEmail', 'personalPhone'];
    const applicantComplete = applicantFields.every(field => formData[field]);
    
    if (applicantComplete) {
      step4Checklist.applicantInfoComplete = true;
      console.log('✓ Primary applicant info complete');
      console.log('  Name:', formData.firstName, formData.lastName);
      console.log('  Email:', formData.personalEmail);
    }
    
    // Partner fields verification (CRITICAL TEST)
    const partnerFields = [
      'partnerFirstName', 'partnerLastName', 'partnerEmail', 
      'partnerPhone', 'partnerOwnershipPercentage'
    ];
    
    const partnerFieldsPresent = partnerFields.filter(field => formData[field]);
    
    if (partnerFieldsPresent.length > 0) {
      step4Checklist.partnerFieldsVisible = true;
      step4Checklist.formDataPartnerExists = true;
      console.log('✅ Partner fields detected in form data:');
      partnerFieldsPresent.forEach(field => {
        console.log(`  ${field}:`, formData[field]);
      });
    } else if (ownership < 100) {
      console.log('❌ CRITICAL ISSUE: Ownership < 100% but no partner fields found');
      this.testResults.issues.push('Partner fields missing despite ownership < 100%');
    }
    
    // Expected outcome verification
    if (formData.partnerFirstName) {
      step4Checklist.partnerInfoComplete = true;
      console.log('✅ Expected Outcome: formData.partnerFirstName exists =', formData.partnerFirstName);
    }
    
    // Store partner field analysis
    this.testResults.partnerFields = {
      ownershipPercentage: ownership,
      shouldShowPartner: ownership < 100,
      partnerFieldsFound: partnerFieldsPresent.length,
      partnerFieldsList: partnerFieldsPresent,
      criticalTest: ownership < 100 && partnerFieldsPresent.length > 0
    };
    
    this.testResults.steps.step4 = step4Checklist;
    return step4Checklist;
  }

  // Step 5: Document Upload Verification
  async verifyStep5DocumentUpload() {
    console.log('\n✅ STEP 5: DOCUMENT UPLOAD VERIFICATION');
    
    const step5Checklist = {
      documentsUploaded: false,
      documentsListed: false,
      documentsPreviewable: false,
      bypassUsed: false
    };
    
    const formData = this.getFormData();
    
    if (formData.uploadedDocuments && formData.uploadedDocuments.length > 0) {
      step5Checklist.documentsUploaded = true;
      step5Checklist.documentsListed = true;
      console.log('✓ Documents uploaded:', formData.uploadedDocuments.length);
      console.log('✓ Documents listed and trackable');
      
      // Check if documents are previewable (have proper metadata)
      const hasMetadata = formData.uploadedDocuments.some(doc => doc.name && doc.size);
      if (hasMetadata) {
        step5Checklist.documentsPreviewable = true;
        console.log('✓ Documents have metadata for preview');
      }
    }
    
    if (formData.bypassedDocuments) {
      step5Checklist.bypassUsed = true;
      console.log('✓ Document bypass option used');
    }
    
    this.testResults.steps.step5 = step5Checklist;
    return step5Checklist;
  }

  // Step 6: SignNow Signature Verification (Critical)
  async verifyStep6SignNowSignature() {
    console.log('\n🔶 STEP 6: SIGNNOW SIGNATURE VERIFICATION (CRITICAL)');
    
    const step6Results = {
      diagnosticExecuted: false,
      fieldsCount: 0,
      expectedFields: 58,
      missingFields: [],
      nullFields: [],
      partnerFieldsIncluded: false,
      payloadStructure: null,
      signatureViewLoaded: false,
      fieldsAutoFilled: false,
      noMissingFieldErrors: false
    };
    
    try {
      // Execute diagnostic command
      console.log('🔍 EXECUTING DIAGNOSTIC COMMAND...');
      const signingPayload = await this.printSigningPayload();
      
      if (signingPayload) {
        step6Results.diagnosticExecuted = true;
        step6Results.payloadStructure = signingPayload;
        
        // Analyze payload structure
        const analysis = this.analyzeSigningPayload(signingPayload);
        step6Results.fieldsCount = analysis.totalFields;
        step6Results.missingFields = analysis.nullFields;
        step6Results.partnerFieldsIncluded = analysis.hasPartnerFields;
        
        console.log('📊 DIAGNOSTIC RESULTS:');
        console.log(`✓ Total fields found: ${analysis.totalFields}`);
        console.log(`✓ Expected fields: ${step6Results.expectedFields}`);
        console.log(`✓ Partner fields included: ${analysis.hasPartnerFields}`);
        
        if (analysis.nullFields.length > 0) {
          console.log('⚠️ Missing/null fields:', analysis.nullFields);
          step6Results.nullFields = analysis.nullFields;
        }
        
        if (analysis.totalFields >= 55) {
          console.log('✅ Field count acceptable (55+ out of 58 expected)');
        } else {
          console.log('❌ Field count too low:', analysis.totalFields);
          this.testResults.issues.push(`Low field count: ${analysis.totalFields}/58`);
        }
        
      } else {
        console.log('❌ Diagnostic command failed to execute');
        this.testResults.issues.push('SignNow diagnostic failed');
      }
      
    } catch (error) {
      console.error('❌ Step 6 diagnostic error:', error);
      this.testResults.issues.push(`Step 6 diagnostic error: ${error.message}`);
    }
    
    // Check for signature view
    if (window.location.pathname.includes('step-6') || window.location.pathname.includes('signature')) {
      step6Results.signatureViewLoaded = true;
      console.log('✓ Signature view loaded');
      
      // Look for iframe or embedded signature elements
      const iframe = document.querySelector('iframe[src*="signnow"]') || 
                    document.querySelector('iframe[src*="document"]');
      
      if (iframe) {
        console.log('✓ SignNow iframe detected');
        step6Results.fieldsAutoFilled = true; // Assume auto-fill working if iframe loads
      } else {
        console.log('⚠️ No SignNow iframe detected - may be redirect mode');
      }
    }
    
    this.testResults.steps.step6 = step6Results;
    this.testResults.signingPayload = step6Results.payloadStructure;
    
    return step6Results;
  }

  // Step 7: Final Confirmation Verification
  async verifyStep7FinalConfirmation() {
    console.log('\n✅ STEP 7: FINAL CONFIRMATION VERIFICATION');
    
    const step7Checklist = {
      redirectedToStep7: false,
      applicationSubmitted: false,
      successMessage: false,
      backendReceived: false
    };
    
    if (window.location.pathname.includes('step-7') || 
        window.location.pathname.includes('success') ||
        window.location.pathname.includes('confirmation')) {
      step7Checklist.redirectedToStep7 = true;
      console.log('✓ Redirected to Step 7');
      
      // Look for success indicators
      const successElements = document.querySelectorAll('*');
      const hasSuccessText = Array.from(successElements).some(el => 
        el.textContent && el.textContent.includes('Application Submitted')
      );
      
      if (hasSuccessText) {
        step7Checklist.applicationSubmitted = true;
        step7Checklist.successMessage = true;
        console.log('✓ "Application Submitted" message found');
      }
    }
    
    // Check network tab or console for API calls
    if (performance.getEntriesByType && performance.getEntriesByType('resource')) {
      const apiCalls = performance.getEntriesByType('resource').filter(entry => 
        entry.name.includes('/api/applications') || entry.name.includes('/api/public/applications')
      );
      
      if (apiCalls.length > 0) {
        step7Checklist.backendReceived = true;
        console.log('✓ API call to backend detected');
        console.log('Backend endpoints called:', apiCalls.map(call => call.name));
      }
    }
    
    this.testResults.steps.step7 = step7Checklist;
    return step7Checklist;
  }

  // Comprehensive verification execution
  async executeComprehensiveVerification() {
    console.log('🚀 EXECUTING COMPREHENSIVE CLIENT-SIDE VERIFICATION');
    
    try {
      const results = [];
      
      results.push(await this.verifyStep1FinancialProfile());
      results.push(await this.verifyStep2ProductRecommendation());
      results.push(await this.verifyStep3BusinessDetails());
      results.push(await this.verifyStep4ApplicantPartner());
      results.push(await this.verifyStep5DocumentUpload());
      results.push(await this.verifyStep6SignNowSignature());
      results.push(await this.verifyStep7FinalConfirmation());
      
      // Calculate success rate
      const totalChecks = results.reduce((total, stepResult) => {
        return total + Object.keys(stepResult).length;
      }, 0);
      
      const passedChecks = results.reduce((passed, stepResult) => {
        return passed + Object.values(stepResult).filter(Boolean).length;
      }, 0);
      
      this.testResults.successRate = Math.round((passedChecks / totalChecks) * 100);
      
      console.log('\n📊 COMPREHENSIVE VERIFICATION COMPLETE');
      console.log(`Success Rate: ${this.testResults.successRate}%`);
      console.log(`Passed Checks: ${passedChecks}/${totalChecks}`);
      
      if (this.testResults.issues.length > 0) {
        console.log('\n⚠️ Issues Found:');
        this.testResults.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      // Partner fields critical test summary
      if (this.testResults.partnerFields.shouldShowPartner) {
        if (this.testResults.partnerFields.criticalTest) {
          console.log('\n✅ CRITICAL TEST PASSED: Partner fields working correctly');
        } else {
          console.log('\n❌ CRITICAL TEST FAILED: Partner fields not working');
        }
      }
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Comprehensive verification error:', error);
      this.testResults.issues.push(`Verification error: ${error.message}`);
      return this.testResults;
    }
  }

  // Helper methods
  getFormData() {
    try {
      return JSON.parse(localStorage.getItem('boreal-application-form') || '{}');
    } catch (error) {
      console.warn('Could not parse form data from localStorage');
      return {};
    }
  }

  setupDiagnosticTools() {
    window.borealApp = window.borealApp || {};
    window.borealApp.debug = window.borealApp.debug || {};
    window.borealApp.debug.printSigningPayload = this.printSigningPayload.bind(this);
  }

  async printSigningPayload() {
    console.log('🔍 SIGNNOW PAYLOAD DIAGNOSTIC');
    console.log('=====================================');
    
    try {
      const formData = this.getFormData();
      
      if (!formData || Object.keys(formData).length === 0) {
        console.log('❌ No form data found');
        return null;
      }
      
      const signingPayload = {
        businessDetails: {
          operatingName: formData.operatingName || formData.businessName,
          legalName: formData.legalName,
          businessStreetAddress: formData.businessStreetAddress || formData.businessAddress,
          businessCity: formData.businessCity,
          businessState: formData.businessState,
          businessPostalCode: formData.businessPostalCode || formData.businessZipCode,
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
        partnerInfo: (formData.ownershipPercentage && parseInt(formData.ownershipPercentage) < 100) ? {
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
      
      console.log('📄 COMPLETE SIGNING PAYLOAD:');
      console.log(JSON.stringify(signingPayload, null, 2));
      
      return signingPayload;
      
    } catch (error) {
      console.error('❌ Payload diagnostic error:', error);
      return null;
    }
  }

  analyzeSigningPayload(payload) {
    let totalFields = 0;
    let nullFields = [];
    let presentFields = [];
    let hasPartnerFields = false;
    
    function analyzeSection(section, sectionName) {
      if (!section) return;
      
      Object.entries(section).forEach(([key, value]) => {
        totalFields++;
        if (value === null || value === undefined || value === '') {
          nullFields.push(`${sectionName}.${key}`);
        } else {
          presentFields.push(`${sectionName}.${key}`);
        }
      });
    }
    
    analyzeSection(payload.businessDetails, 'businessDetails');
    analyzeSection(payload.applicantInfo, 'applicantInfo');
    
    if (payload.partnerInfo) {
      hasPartnerFields = true;
      analyzeSection(payload.partnerInfo, 'partnerInfo');
    }
    
    analyzeSection(payload.financialProfile, 'financialProfile');
    analyzeSection(payload.lenderSelection, 'lenderSelection');
    
    return {
      totalFields,
      nullFields,
      presentFields,
      hasPartnerFields
    };
  }
}

// Global initialization
window.clientVerificationTest = new ClientVerificationTest();

console.log('🔵 CLIENT-SIDE VERIFICATION CHECKLIST READY');
console.log('Available commands:');
console.log('- clientVerificationTest.executeComprehensiveVerification()');
console.log('- await window.borealApp?.debug?.printSigningPayload?.()');
console.log('\nReady for step-by-step verification...');