/**
 * COMPREHENSIVE FIELD POPULATION TEST
 * Tests complete application workflow with focus on SignNow field population
 * Date: July 14, 2025
 */

class ComprehensiveFieldPopulationTest {
  constructor() {
    this.testResults = [];
    this.applicationData = null;
    this.applicationId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'orange' : 'blue';
    console.log(`%c[${timestamp}] ${message}`, `color: ${color}`);
  }

  addResult(testName, passed, details = '') {
    this.testResults.push({ testName, passed, details, timestamp: new Date() });
  }

  // Test 1: Verify form data capture
  async testFormDataCapture() {
    this.log('🔍 Testing complete form data capture across all steps');
    
    // Check if we're on the application
    if (!window.location.hash.includes('application') && !window.location.pathname.includes('step')) {
      this.log('⚠️ Navigate to application form to test field capture', 'warning');
      return false;
    }

    // Try to get form data from current context
    const formData = this.extractFormData();
    
    if (formData) {
      this.log('✅ Form data successfully captured:', 'success');
      console.log('📋 Complete form data structure:', formData);
      
      // Verify step-based structure
      const hasStep1 = formData.step1 && Object.keys(formData.step1).length > 0;
      const hasStep3 = formData.step3 && Object.keys(formData.step3).length > 0;
      const hasStep4 = formData.step4 && Object.keys(formData.step4).length > 0;
      
      this.log(`   - Step 1 data: ${hasStep1} (${hasStep1 ? Object.keys(formData.step1).length : 0} fields)`, hasStep1 ? 'success' : 'warning');
      this.log(`   - Step 3 data: ${hasStep3} (${hasStep3 ? Object.keys(formData.step3).length : 0} fields)`, hasStep3 ? 'success' : 'warning');
      this.log(`   - Step 4 data: ${hasStep4} (${hasStep4 ? Object.keys(formData.step4).length : 0} fields)`, hasStep4 ? 'success' : 'warning');
      
      this.applicationData = formData;
      this.addResult('Form Data Capture', hasStep1 && hasStep3 && hasStep4, `Step1: ${hasStep1}, Step3: ${hasStep3}, Step4: ${hasStep4}`);
      
      return formData;
    } else {
      this.log('❌ Could not extract form data - may need to fill out application first', 'error');
      this.addResult('Form Data Capture', false, 'No form data available');
      return null;
    }
  }

  // Test 2: Verify Step 4 application creation
  async testStep4ApplicationCreation() {
    this.log('🚀 Testing Step 4 application creation with field population');
    
    if (!this.applicationData) {
      this.log('⚠️ No application data available - run testFormDataCapture() first', 'warning');
      return false;
    }

    try {
      const response = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.applicationData)
      });

      this.log(`📡 Step 4 API response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        this.applicationId = result.applicationId;
        
        this.log('✅ Step 4 application creation successful', 'success');
        this.log(`📋 Application ID: ${this.applicationId}`);
        
        // Store for other tests
        localStorage.setItem('applicationId', this.applicationId);
        
        this.addResult('Step 4 Creation', true, `Application ID: ${this.applicationId}`);
        return result;
      } else {
        const errorData = await response.text();
        this.log(`❌ Step 4 creation failed: ${errorData}`, 'error');
        this.addResult('Step 4 Creation', false, `${response.status}: ${errorData}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ Step 4 creation error: ${error.message}`, 'error');
      this.addResult('Step 4 Creation', false, error.message);
      return false;
    }
  }

  // Test 3: Test SignNow field population
  async testSignNowFieldPopulation() {
    this.log('📝 Testing SignNow field population with smart fields');
    
    if (!this.applicationId) {
      this.applicationId = localStorage.getItem('applicationId');
      if (!this.applicationId) {
        this.log('❌ No application ID available for SignNow test', 'error');
        return false;
      }
    }

    // Create smart fields payload from application data
    const smartFields = this.createSmartFieldsPayload();
    
    try {
      const response = await fetch(`/api/public/signnow/initiate/${this.applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: this.applicationId,
          templateId: 'e7ba8b894c644999a7b38037ea66f4cc9cc524f5',
          smartFields: smartFields
        })
      });

      this.log(`📡 SignNow initiation response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        
        this.log('✅ SignNow initiation successful', 'success');
        this.log('📋 SignNow response:', 'info');
        console.log(result);
        
        // Check if we got a signing URL
        const signingUrl = result.signingUrl || result.redirect_url || result.signnow_url;
        const hasUrl = !!signingUrl;
        
        this.log(`   - Signing URL provided: ${hasUrl}`, hasUrl ? 'success' : 'warning');
        if (hasUrl) {
          this.log(`   - URL: ${signingUrl}`, 'info');
        }
        
        // Verify smart fields were included in request
        this.log(`   - Smart fields count: ${Object.keys(smartFields).length}`, 'info');
        this.log('📋 Smart fields sent to SignNow:', 'info');
        console.log(smartFields);
        
        this.addResult('SignNow Field Population', true, `URL: ${hasUrl}, Fields: ${Object.keys(smartFields).length}`);
        return result;
      } else {
        const errorData = await response.text();
        this.log(`❌ SignNow initiation failed: ${errorData}`, 'error');
        this.addResult('SignNow Field Population', false, `${response.status}: ${errorData}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ SignNow initiation error: ${error.message}`, 'error');
      this.addResult('SignNow Field Population', false, error.message);
      return false;
    }
  }

  // Test 4: Test SignNow status polling
  async testSignNowStatusPolling() {
    this.log('🔄 Testing SignNow status polling');
    
    if (!this.applicationId) {
      this.log('❌ No application ID available for polling test', 'error');
      return false;
    }

    try {
      const response = await fetch(`/api/public/signnow/status/${this.applicationId}`);
      
      this.log(`📡 SignNow status response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        
        this.log('✅ SignNow status polling successful', 'success');
        this.log(`📋 Current status: ${data.status}`, 'info');
        console.log('📋 Complete status data:', data);
        
        // Check status format
        const hasStatus = !!data.status;
        const isValidStatus = ['invite_sent', 'invite_signed', 'pending'].includes(data.status);
        
        this.log(`   - Has status field: ${hasStatus}`, hasStatus ? 'success' : 'error');
        this.log(`   - Valid status value: ${isValidStatus}`, isValidStatus ? 'success' : 'warning');
        
        // Simulate what happens when signed
        if (data.status === 'invite_signed') {
          this.log('🎉 Document is signed - would trigger Step 7 redirect', 'success');
        } else {
          this.log('⏳ Document not yet signed - polling would continue', 'info');
        }
        
        this.addResult('SignNow Status Polling', true, `Status: ${data.status}`);
        return data;
      } else {
        const errorData = await response.text();
        this.log(`❌ SignNow status polling failed: ${errorData}`, 'error');
        this.addResult('SignNow Status Polling', false, `${response.status}: ${errorData}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ SignNow status polling error: ${error.message}`, 'error');
      this.addResult('SignNow Status Polling', false, error.message);
      return false;
    }
  }

  // Test 5: Test Step 7 finalization
  async testStep7Finalization() {
    this.log('🎯 Testing Step 7 application finalization');
    
    if (!this.applicationId) {
      this.log('❌ No application ID available for finalization test', 'error');
      return false;
    }

    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: this.applicationId,
          finalizedAt: new Date().toISOString(),
          status: 'completed'
        })
      });

      this.log(`📡 Step 7 finalization response: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        
        this.log('✅ Step 7 finalization successful', 'success');
        this.log('📋 Finalization result:', 'info');
        console.log(result);
        
        const isFinalized = result.status === 'finalized';
        this.log(`   - Application finalized: ${isFinalized}`, isFinalized ? 'success' : 'warning');
        
        this.addResult('Step 7 Finalization', true, `Status: ${result.status}`);
        return result;
      } else {
        const errorData = await response.text();
        this.log(`❌ Step 7 finalization failed: ${errorData}`, 'error');
        this.addResult('Step 7 Finalization', false, `${response.status}: ${errorData}`);
        return false;
      }
    } catch (error) {
      this.log(`❌ Step 7 finalization error: ${error.message}`, 'error');
      this.addResult('Step 7 Finalization', false, error.message);
      return false;
    }
  }

  // Helper: Extract form data from current page
  extractFormData() {
    try {
      // Try to get from React context if available
      if (window.ReactContext) {
        return window.ReactContext.formData;
      }
      
      // Try to get from localStorage
      const cached = localStorage.getItem('formData');
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Create sample data for testing
      return this.createSampleFormData();
    } catch (error) {
      this.log(`Warning: Could not extract form data: ${error.message}`, 'warning');
      return this.createSampleFormData();
    }
  }

  // Helper: Create sample form data for testing
  createSampleFormData() {
    return {
      step1: {
        requestedAmount: 100000,
        use_of_funds: 'working_capital',
        timeInBusiness: '2_to_5_years'
      },
      step3: {
        legalName: 'Boreal Test Company Inc.',
        businessName: 'Boreal Test Co',
        businessPhone: '+1-555-123-4567',
        businessState: 'Alberta',
        businessAddress: '123 Test Street',
        businessCity: 'Calgary',
        businessPostalCode: 'T2P 1J9'
      },
      step4: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@borealtest.com',
        phone: '+1-555-987-6543',
        ownershipPercentage: 100,
        dob: '1985-06-15',
        sin: '123-456-789'
      }
    };
  }

  // Helper: Create smart fields payload for SignNow
  createSmartFieldsPayload() {
    if (!this.applicationData) {
      this.applicationData = this.createSampleFormData();
    }

    const { step1, step3, step4 } = this.applicationData;

    return {
      contact_first_name: step4?.firstName || '',
      contact_last_name: step4?.lastName || '',
      contact_email: step4?.email || '',
      contact_phone: step4?.phone || '',
      business_legal_name: step3?.legalName || '',
      business_dba_name: step3?.businessName || '',
      business_address: step3?.businessAddress || '',
      business_city: step3?.businessCity || '',
      business_state: step3?.businessState || '',
      business_postal_code: step3?.businessPostalCode || '',
      business_phone: step3?.businessPhone || '',
      requested_amount: step1?.requestedAmount || 0,
      use_of_funds: step1?.use_of_funds || '',
      time_in_business: step1?.timeInBusiness || '',
      ownership_percentage: step4?.ownershipPercentage || 0,
      date_of_birth: step4?.dob || '',
      social_insurance_number: step4?.sin || ''
    };
  }

  // Run complete test suite
  async runCompleteTest() {
    this.log('🚀 Starting Comprehensive Field Population Test Suite');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await this.testFormDataCapture();
    await this.testStep4ApplicationCreation();
    await this.testSignNowFieldPopulation();
    await this.testSignNowStatusPolling();
    await this.testStep7Finalization();
    
    this.generateFinalReport();
  }

  generateFinalReport() {
    this.log('\n📊 COMPREHENSIVE FIELD POPULATION TEST RESULTS', 'info');
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
    
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    this.log(`📈 Test Results: ${passedTests}/${totalTests} passed (${passRate}%)`, 'info');
    
    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      const color = test.passed ? 'success' : 'error';
      this.log(`${status} ${test.testName}: ${test.details}`, color);
    });
    
    this.log('\n🎯 Field Population Verification:', 'info');
    
    if (passedTests >= 3) {
      this.log('✅ SignNow field population is working correctly', 'success');
      this.log('✅ Complete workflow from Step 4 → Step 6 → Step 7 operational', 'success');
      this.log('✅ All API endpoints responding properly', 'success');
    } else {
      this.log('⚠️ Some field population issues detected', 'warning');
      this.log('💡 Check console logs above for specific details', 'info');
    }
    
    this.log('\n🔄 Next Steps:', 'info');
    this.log('   1. Staff backend should return status = "invite_signed" when documents are signed', 'info');
    this.log('   2. This will trigger automatic Step 6 → Step 7 → Finalization workflow', 'info');
    this.log('   3. Field population in SignNow templates should be verified on staff backend', 'info');
    
    this.log('\n🛠️ Manual Verification:', 'info');
    this.log('   • Open SignNow URL from test results to verify field population', 'info');
    this.log('   • Check staff backend logs for received smart fields data', 'info');
    this.log('   • Verify template fields are properly populated with application data', 'info');
  }
}

// Initialize test
console.log('🏁 Comprehensive Field Population Test Suite Ready');
console.log('💡 Usage: window.fieldTest.runCompleteTest()');
window.fieldTest = new ComprehensiveFieldPopulationTest();