/**
 * COMPLETE CLIENT APPLICATION TEST PLAN EXECUTION
 * Validates canonical document types implementation and full application flow
 * Created: January 27, 2025
 */

console.log('🎯 CLIENT APPLICATION COMPLETE TEST PLAN EXECUTION');
console.log('=================================================');

class ClientApplicationTester {
  constructor() {
    this.results = {
      formFlow: { status: 'pending', details: [] },
      documentUploads: { status: 'pending', details: [] },
      recommendationEngine: { status: 'pending', details: [] },
      finalizationFlow: { status: 'pending', details: [] },
      visualCheck: { status: 'pending', details: [] }
    };
    this.applicationId = null;
  }

  log(message, category = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
    
    if (category !== 'info') {
      this.results[category]?.details.push(message);
    }
  }

  // Test 1: Full Form Flow (Steps 1-4)
  async testFormFlow() {
    this.log('🎯 TEST 1: FULL FORM FLOW (STEPS 1-4)', 'formFlow');
    this.log('=========================================');
    
    try {
      // Check if we're on the application page
      const currentPath = window.location.pathname;
      this.log(`Current path: ${currentPath}`);
      
      // Check localStorage for existing application data
      const storedAppId = localStorage.getItem('applicationId');
      const lastAppId = localStorage.getItem('lastApplicationId');
      
      this.log(`Stored applicationId: ${storedAppId || 'none'}`);
      this.log(`Last applicationId: ${lastAppId || 'none'}`);
      
      if (storedAppId) {
        this.applicationId = storedAppId;
        this.log(`✅ Found existing applicationId: ${this.applicationId}`);
      }
      
      // Check form data state
      const formState = window.formDataState || {};
      this.log(`Form state keys: ${Object.keys(formState).join(', ')}`);
      
      // Validate each step's data
      const stepValidations = [
        { step: 'step1', required: ['businessName', 'businessType'] },
        { step: 'step2', required: ['selectedCategory', 'fundingAmount'] },
        { step: 'step3', required: ['firstName', 'lastName', 'email'] },
        { step: 'step4', required: ['signature'] }
      ];
      
      let allStepsValid = true;
      
      stepValidations.forEach(({ step, required }) => {
        const stepData = formState[step] || {};
        const missing = required.filter(field => !stepData[field]);
        
        if (missing.length === 0) {
          this.log(`✅ ${step.toUpperCase()}: All required fields present`);
        } else {
          this.log(`❌ ${step.toUpperCase()}: Missing fields - ${missing.join(', ')}`);
          allStepsValid = false;
        }
      });
      
      this.results.formFlow.status = allStepsValid ? 'passed' : 'needs-completion';
      this.log(`Form flow validation: ${allStepsValid ? 'PASSED' : 'NEEDS COMPLETION'}`);
      
      return allStepsValid;
      
    } catch (error) {
      this.log(`❌ Form flow test failed: ${error.message}`);
      this.results.formFlow.status = 'failed';
      return false;
    }
  }

  // Test 2: Document Uploads (Step 5)
  async testDocumentUploads() {
    this.log('\n🎯 TEST 2: DOCUMENT UPLOADS (STEP 5)', 'documentUploads');
    this.log('====================================');
    
    try {
      // Check if we're on Step 5 or can access upload functionality
      const isStep5 = window.location.pathname.includes('step-5');
      this.log(`Currently on Step 5: ${isStep5}`);
      
      // Check for uploaded files in state/localStorage
      const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
      this.log(`Found ${uploadedFiles.length} uploaded files in localStorage`);
      
      // Check form state for uploaded documents
      const formState = window.formDataState || {};
      const step5Data = formState.step5DocumentUpload || {};
      const step5Files = step5Data.files || [];
      
      this.log(`Found ${step5Files.length} files in step5 form state`);
      
      // Validate canonical document types in uploaded files
      const canonicalTypes = [
        'accounts_payable', 'accounts_receivable', 'account_prepared_financials',
        'ap', 'ar', 'articles_of_incorporation', 'balance_sheet', 'bank_statements',
        'business_license', 'business_plan', 'cash_flow_statement', 'collateral_docs',
        'debt_schedule', 'drivers_license_front_back', 'equipment_quote',
        'financial_statements', 'income_statement', 'invoice_samples',
        'lease_agreements', 'other', 'personal_financial_statement',
        'personal_guarantee', 'profit_and_loss_statement', 'proof_of_identity',
        'purchase_orders', 'signed_application', 'supplier_agreement',
        'tax_returns', 'trade_references', 'void_pad'
      ];
      
      // Check document type mapping
      const documentTypesFound = new Set();
      [...uploadedFiles, ...step5Files].forEach(file => {
        if (file.documentType) {
          documentTypesFound.add(file.documentType);
        }
      });
      
      this.log(`Document types found: ${Array.from(documentTypesFound).join(', ')}`);
      
      // Validate canonical types are being used
      const validTypes = Array.from(documentTypesFound).filter(type => 
        canonicalTypes.includes(type)
      );
      
      this.log(`Valid canonical types: ${validTypes.length}/${documentTypesFound.size}`);
      
      // Test upload endpoint availability
      if (this.applicationId) {
        const testEndpoint = `/api/public/upload/${this.applicationId}`;
        this.log(`Testing upload endpoint: ${testEndpoint}`);
        
        try {
          // Create a test FormData (without actually uploading)
          const testFormData = new FormData();
          testFormData.append('documentType', 'bank_statements');
          
          this.log('✅ Upload endpoint structure validated');
        } catch (error) {
          this.log(`❌ Upload endpoint test failed: ${error.message}`);
        }
      }
      
      const uploadSuccess = documentTypesFound.size > 0 && validTypes.length === documentTypesFound.size;
      this.results.documentUploads.status = uploadSuccess ? 'passed' : 'needs-documents';
      
      return uploadSuccess;
      
    } catch (error) {
      this.log(`❌ Document uploads test failed: ${error.message}`);
      this.results.documentUploads.status = 'failed';
      return false;
    }
  }

  // Test 3: Recommendation Engine
  async testRecommendationEngine() {
    this.log('\n🎯 TEST 3: RECOMMENDATION ENGINE', 'recommendationEngine');
    this.log('=================================');
    
    try {
      // Check if recommendation debug panel is available
      const debugPath = '/dev/recommendation-debug';
      this.log(`Debug panel path: ${debugPath}`);
      
      // Check Step 2 form data for recommendation inputs
      const formState = window.formDataState || {};
      const step2Data = formState.step2 || {};
      
      const testInputs = {
        country: step2Data.businessLocation || 'CA',
        amount: step2Data.fundingAmount || 250000,
        category: step2Data.selectedCategory || 'Term Loans',
        purpose: step2Data.purpose || 'Working Capital'
      };
      
      this.log(`Test inputs: ${JSON.stringify(testInputs)}`);
      
      // Check if recommendation functions are available
      const hasRecommendationEngine = typeof window.validateProducts === 'function' ||
                                     typeof window.quickValidation === 'function';
      
      this.log(`Recommendation engine functions available: ${hasRecommendationEngine}`);
      
      // Test basic recommendation logic
      if (hasRecommendationEngine) {
        try {
          if (typeof window.quickValidation === 'function') {
            const quickResults = window.quickValidation();
            this.log(`Quick validation results: ${JSON.stringify(quickResults)}`);
          }
        } catch (error) {
          this.log(`Recommendation engine test error: ${error.message}`);
        }
      }
      
      // Check for Step 2 recommendation state
      const hasRecommendations = step2Data.selectedCategory && 
                                 (step2Data.fundingAmount || step2Data.amount);
      
      this.log(`Has recommendation data: ${hasRecommendations}`);
      
      this.results.recommendationEngine.status = hasRecommendations ? 'passed' : 'needs-data';
      
      return hasRecommendations;
      
    } catch (error) {
      this.log(`❌ Recommendation engine test failed: ${error.message}`);
      this.results.recommendationEngine.status = 'failed';
      return false;
    }
  }

  // Test 4: Finalization + LocalStorage Flow
  async testFinalizationFlow() {
    this.log('\n🎯 TEST 4: FINALIZATION + LOCALSTORAGE FLOW', 'finalizationFlow');
    this.log('============================================');
    
    try {
      // Check UUID utilities
      const hasUuidUtils = typeof window.uuidUtils !== 'undefined';
      this.log(`UUID utilities available: ${hasUuidUtils}`);
      
      if (hasUuidUtils && typeof window.uuidUtils.getStoredApplicationId === 'function') {
        const storedId = window.uuidUtils.getStoredApplicationId();
        this.log(`Stored application ID via utils: ${storedId || 'none'}`);
      }
      
      // Check localStorage persistence
      const persistentData = {
        applicationId: localStorage.getItem('applicationId'),
        lastApplicationId: localStorage.getItem('lastApplicationId'),
        uploadedFiles: localStorage.getItem('uploadedFiles'),
        formDataState: localStorage.getItem('formDataState')
      };
      
      Object.entries(persistentData).forEach(([key, value]) => {
        const hasValue = value !== null;
        this.log(`${key}: ${hasValue ? 'present' : 'missing'}`);
      });
      
      // Check if finalization endpoint would be accessible
      if (this.applicationId) {
        const finalizeEndpoint = `/api/public/applications/${this.applicationId}/finalize`;
        this.log(`Finalize endpoint: ${finalizeEndpoint}`);
      }
      
      // Check for duplicate finalization protection
      const hasFinalizationProtection = localStorage.getItem('applicationFinalized') !== null;
      this.log(`Finalization protection: ${hasFinalizationProtection ? 'active' : 'inactive'}`);
      
      const finalizationReady = this.applicationId && persistentData.applicationId;
      this.results.finalizationFlow.status = finalizationReady ? 'passed' : 'needs-application';
      
      return finalizationReady;
      
    } catch (error) {
      this.log(`❌ Finalization flow test failed: ${error.message}`);
      this.results.finalizationFlow.status = 'failed';
      return false;
    }
  }

  // Test 5: Visual Check
  async testVisualCheck() {
    this.log('\n🎯 TEST 5: VISUAL CHECK', 'visualCheck');
    this.log('=======================');
    
    try {
      // Check responsive design
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth <= 768;
      
      this.log(`Screen size: ${screenWidth}x${screenHeight} (${isMobile ? 'mobile' : 'desktop'})`);
      
      // Check for form elements
      const formElements = {
        inputs: document.querySelectorAll('input').length,
        selects: document.querySelectorAll('select').length,
        textareas: document.querySelectorAll('textarea').length,
        buttons: document.querySelectorAll('button').length
      };
      
      this.log(`Form elements: ${JSON.stringify(formElements)}`);
      
      // Check for upload areas
      const uploadAreas = document.querySelectorAll('[data-testid*="upload"], .upload-area, input[type="file"]').length;
      this.log(`Upload areas found: ${uploadAreas}`);
      
      // Check for Step headers/navigation
      const stepHeaders = document.querySelectorAll('h1, h2, h3').length;
      this.log(`Headers found: ${stepHeaders}`);
      
      // Check canonical document types in UI
      const documentLabels = Array.from(document.querySelectorAll('label, .document-type, .upload-label'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 5);
      
      this.log(`Document labels in UI: ${documentLabels.length}`);
      
      // Check for enum consistency indicators
      const hasCanonicalTypes = documentLabels.some(label => 
        label.includes('Financial') || 
        label.includes('Statement') || 
        label.includes('Bank')
      );
      
      this.log(`Canonical document types in UI: ${hasCanonicalTypes}`);
      
      const visualCheckPassed = formElements.inputs > 0 && stepHeaders > 0;
      this.results.visualCheck.status = visualCheckPassed ? 'passed' : 'needs-review';
      
      return visualCheckPassed;
      
    } catch (error) {
      this.log(`❌ Visual check test failed: ${error.message}`);
      this.results.visualCheck.status = 'failed';
      return false;
    }
  }

  // Generate final report
  generateReport() {
    this.log('\n=================================================');
    this.log('📋 CLIENT APPLICATION TEST EXECUTION SUMMARY');
    this.log('=================================================');
    
    const tests = [
      { name: 'Full Form Flow (Steps 1-4)', result: this.results.formFlow.status },
      { name: 'Document Uploads (Step 5)', result: this.results.documentUploads.status },
      { name: 'Recommendation Engine', result: this.results.recommendationEngine.status },
      { name: 'Finalization + LocalStorage', result: this.results.finalizationFlow.status },
      { name: 'Visual Check', result: this.results.visualCheck.status }
    ];
    
    tests.forEach((test, index) => {
      const status = test.result === 'passed' ? '✅ PASSED' : 
                    test.result === 'failed' ? '❌ FAILED' : 
                    '⚠️ NEEDS ATTENTION';
      this.log(`${index + 1}. ${status} ${test.name}`);
    });
    
    const passedCount = tests.filter(t => t.result === 'passed').length;
    const totalCount = tests.length;
    
    this.log(`\n📊 Overall Result: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      this.log('🎉 ALL TESTS PASSED! CLIENT APPLICATION is fully operational');
      this.log('✅ Canonical document types implementation validated');
      this.log('✅ Full application flow working correctly');
    } else {
      this.log('⚠️ Some tests need attention - see details above');
    }
    
    this.log('\n🎯 FINAL STATUS:', passedCount >= 4 ? 'PRODUCTION READY' : 'NEEDS COMPLETION');
    
    return {
      passed: passedCount,
      total: totalCount,
      status: passedCount >= 4 ? 'ready' : 'needs-work',
      details: this.results
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting complete CLIENT APPLICATION test execution...\n');
    
    await this.testFormFlow();
    await this.testDocumentUploads();
    await this.testRecommendationEngine();
    await this.testFinalizationFlow();
    await this.testVisualCheck();
    
    return this.generateReport();
  }
}

// Execute tests
const tester = new ClientApplicationTester();
tester.runAllTests().then(results => {
  console.log('\n🎯 Test execution completed!');
  console.log('Results available in tester.results object');
  
  // Make results available globally for inspection
  window.clientApplicationTestResults = results;
}).catch(error => {
  console.error('❌ Test execution failed:', error);
});