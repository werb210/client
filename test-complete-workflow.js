/**
 * Complete Application Workflow Test
 * Tests the full application creation, document upload, and finalization process
 */

class CompleteWorkflowTest {
  constructor() {
    this.applicationId = null;
    this.testResults = [];
    this.dynamicEmail = `testuser+${Date.now()}@example.com`;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || '📋';
    
    const logMsg = `${prefix} [${timestamp}] ${message}`;
    console.log(logMsg);
  }

  addResult(step, success, details) {
    this.testResults.push({ step, success, details, timestamp: new Date() });
    this.log(`${step}: ${success ? 'PASSED' : 'FAILED'} - ${details}`, success ? 'success' : 'error');
  }

  async testStep1_CreateApplication() {
    this.log('Testing Step 1: Create application with unique email', 'info');
    
    const applicationData = {
      step1: {
        businessLocation: "CA",
        headquarters: "US", 
        headquartersState: "",
        industry: "transportation",
        lookingFor: "capital",
        fundingAmount: 45000,
        fundsPurpose: "working_capital",
        salesHistory: "3+yr",
        revenueLastYear: 275000,
        averageMonthlyRevenue: 27000,
        accountsReceivableBalance: 0,
        fixedAssetsValue: 0,
        equipmentValue: 0,
        requestedAmount: 45000
      },
      step3: {
        operatingName: "Dynamic Test Business Inc",
        employeeCount: 3,
        estimatedYearlyRevenue: 520000,
        legalName: "Dynamic Test Business Inc",
        businessStructure: "corporation",
        businessStreetAddress: "456 Dynamic Test Street",
        businessCity: "Calgary",
        businessState: "AB",
        businessPostalCode: "T5R 6T6",
        businessPhone: "+18889991234",
        businessStartDate: "2015-08-15",
        businessWebsite: ""
      },
      step4: {
        applicantFirstName: "Dynamic",
        applicantLastName: "Tester",
        applicantEmail: this.dynamicEmail,
        applicantPhone: "+15879992345",
        applicantAddress: "456 Dynamic Test Address",
        applicantCity: "Calgary",
        applicantState: "AB",
        applicantZipCode: "T5R 6T6",
        applicantDateOfBirth: "1988-06-15",
        applicantSSN: "",
        ownershipPercentage: 100,
        hasPartner: false,
        partnerFirstName: "",
        partnerLastName: "",
        partnerEmail: "",
        partnerPhone: "",
        partnerAddress: "",
        partnerCity: "",
        partnerState: "",
        partnerZipCode: "",
        partnerDateOfBirth: "",
        partnerSSN: "",
        partnerOwnershipPercentage: 0,
        email: this.dynamicEmail
      }
    };
    
    try {
      this.log(`Using dynamic email: ${this.dynamicEmail}`, 'info');
      
      const response = await fetch('/api/public/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: JSON.stringify(applicationData)
      });
      
      this.log(`Application creation response: ${response.status} ${response.statusText}`, 'info');
      
      if (response.ok) {
        const result = await response.json();
        this.applicationId = result.applicationId;
        
        // Validate UUID format
        const isUuid = this.applicationId && this.applicationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        const isFallback = this.applicationId && this.applicationId.startsWith('fallback_');
        
        if (isUuid && !isFallback) {
          this.addResult('Create with unique email', true, `UUID: ${this.applicationId}`);
          return true;
        } else {
          this.addResult('Create with unique email', false, `Got ${isFallback ? 'fallback' : 'invalid'} ID: ${this.applicationId}`);
          return false;
        }
      } else {
        const errorText = await response.text();
        this.addResult('Create with unique email', false, `${response.status}: ${errorText}`);
        return false;
      }
    } catch (error) {
      this.addResult('Create with unique email', false, `Network error: ${error.message}`);
      return false;
    }
  }

  async testStep2_DocumentUpload() {
    if (!this.applicationId) {
      this.addResult('Document upload', false, 'No application ID available');
      return false;
    }

    this.log('Testing Step 2: Document upload simulation', 'info');
    
    try {
      // Create a test blob to simulate document upload
      const testDocument = new Blob(['Test bank statement content'], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', testDocument, 'test-bank-statement.pdf');
      formData.append('documentType', 'bank_statements');

      const response = await fetch(`/api/public/upload/${this.applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('Document upload', true, `Document uploaded: ${result.documentId || 'success'}`);
        return true;
      } else {
        const errorText = await response.text();
        this.addResult('Document upload', false, `${response.status}: ${errorText}`);
        return false;
      }
    } catch (error) {
      this.addResult('Document upload', false, `Upload error: ${error.message}`);
      return false;
    }
  }

  async testStep3_ApplicationFinalization() {
    if (!this.applicationId) {
      this.addResult('Finalize application', false, 'No application ID available');
      return false;
    }

    this.log('Testing Step 3: Application finalization', 'info');
    
    const finalizationData = {
      step1: {
        businessLocation: "CA",
        fundingAmount: 45000,
        requestedAmount: 45000
      },
      step3: {
        operatingName: "Dynamic Test Business Inc",
        legalName: "Dynamic Test Business Inc"
      },
      step4: {
        applicantFirstName: "Dynamic",
        applicantLastName: "Tester",
        applicantEmail: this.dynamicEmail
      },
      applicationId: this.applicationId
    };

    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        },
        body: JSON.stringify(finalizationData)
      });

      if (response.ok) {
        const result = await response.json();
        this.addResult('Finalize application', true, `Status: ${result.status || 'submitted'}`);
        return true;
      } else {
        const errorText = await response.text();
        this.log(`Finalization failed: ${response.status} - ${errorText}`, 'error');
        this.addResult('Finalize application', false, `${response.status}: ${errorText}`);
        return false;
      }
    } catch (error) {
      this.addResult('Finalize application', false, `Finalization error: ${error.message}`);
      return false;
    }
  }

  async testStep4_StaffPortalVerification() {
    this.log('Testing Step 4: Staff portal verification (simulated)', 'info');
    
    // Simulate staff portal check by verifying application data accessibility
    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const hasRequiredFields = result.applicantName || result.businessName || result.requestedAmount;
        
        if (hasRequiredFields) {
          this.addResult('View in staff dashboard', true, 'Application data accessible');
          return true;
        } else {
          this.addResult('View in staff dashboard', false, 'Missing required fields');
          return false;
        }
      } else {
        this.addResult('View in staff dashboard', false, `Cannot access application: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.addResult('View in staff dashboard', false, `Access error: ${error.message}`);
      return false;
    }
  }

  async testStep5_DocumentAccessibility() {
    this.log('Testing Step 5: Document accessibility', 'info');
    
    try {
      const response = await fetch(`/api/public/applications/${this.applicationId}/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
        }
      });

      if (response.ok || response.status === 304) {
        this.addResult('Preview/download documents', true, 'Document endpoint accessible');
        return true;
      } else {
        this.addResult('Preview/download documents', false, `Document access failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.addResult('Preview/download documents', false, `Document error: ${error.message}`);
      return false;
    }
  }

  async runCompleteTest() {
    this.log('🚀 Starting Complete Application Workflow Test', 'info');
    this.log('================================================', 'info');
    
    const step1 = await this.testStep1_CreateApplication();
    const step2 = await this.testStep2_DocumentUpload();
    const step3 = await this.testStep3_ApplicationFinalization();
    const step4 = await this.testStep4_StaffPortalVerification();
    const step5 = await this.testStep5_DocumentAccessibility();
    
    // Final verification - no fallback ID used
    const noFallbackId = this.applicationId && !this.applicationId.startsWith('fallback_');
    this.addResult('No fallback ID used', noFallbackId, `Final ID: ${this.applicationId}`);
    
    // Summary
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    this.log('================================================', 'info');
    this.log(`TEST SUMMARY: ${passedTests}/${totalTests} tests passed (${passRate}%)`, passRate === '100.0' ? 'success' : 'warning');
    this.log('================================================', 'info');
    
    // Detailed results
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.step}: ${result.details}`);
    });
    
    if (passRate === '100.0') {
      this.log('🎉 ALL TESTS PASSED - Ready for Chat Escalation + Sticky Notes module', 'success');
    } else {
      this.log('⚠️ Some tests failed - Review before proceeding', 'warning');
    }
    
    return {
      success: passRate === '100.0',
      applicationId: this.applicationId,
      results: this.testResults,
      passRate: passRate
    };
  }
}

// Auto-run the complete test
const workflowTest = new CompleteWorkflowTest();
window.completeWorkflowTest = workflowTest;

console.log('🚀 Starting Complete Application Workflow Test...');
workflowTest.runCompleteTest().then(results => {
  window.workflowTestResults = results;
  console.log('\n📋 Test completed. Results stored in window.workflowTestResults');
});

// Export for manual re-run
window.runCompleteWorkflowTest = () => {
  const newTest = new CompleteWorkflowTest();
  return newTest.runCompleteTest();
};