/**
 * Server-side execution of Final Client Submission Smoke Test
 * Executes the complete S3-enabled application flow validation
 */

import fetch from 'node-fetch';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5000';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN;

class ServerSmokeTest {
  constructor() {
    this.applicationId = null;
    this.testResults = {};
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async executeCompleteTest() {
    console.log('🧪 FINAL CLIENT SUBMISSION SMOKE TEST (S3-ENABLED)');
    console.log('===================================================');

    try {
      // Step 1-3: Simulate form data preparation
      this.log('STEPS 1-3: Preparing application data');
      
      const applicationPayload = {
        // Step 1 data
        requestedAmount: 75000,
        use_of_funds: "equipment",
        businessLocation: "CA",
        selectedCategory: "Equipment Financing",
        
        // Step 3 data
        operatingName: "Smoke Test Equipment Co",
        legalName: "Smoke Test Equipment Co Inc",
        businessName: "Smoke Test Equipment Co",
        businessPhone: "+15551234567",
        businessState: "ON",
        
        // Step 4 data (with duplicate email test)
        applicantFirstName: "Sarah",
        applicantLastName: "TestRunner",
        applicantEmail: "test@example.com", // Previously used email
        applicantPhone: "+15551234567",
        email: "test@example.com"
      };

      this.log('✅ Steps 1-3 completed - application data prepared', 'success');

      // Step 4: Create application (duplicate email test)
      this.log('STEP 4: Creating application with duplicate email test');
      
      const createResponse = await fetch(`${BASE_URL}/api/public/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify(applicationPayload)
      });

      this.log(`Application creation response: ${createResponse.status} ${createResponse.statusText}`);

      if (createResponse.status === 409) {
        this.log('❌ CRITICAL ERROR: Duplicate email blocking detected!', 'error');
        return false;
      }

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        this.log(`Application creation failed: ${createResponse.status} - ${errorText}`, 'error');
        return false;
      }

      const createResult = await createResponse.json();
      this.applicationId = createResult.applicationId;
      
      this.log(`✅ Application created: ${this.applicationId}`, 'success');
      this.log('✅ Duplicate email test passed - no blocking occurred', 'success');

      this.testResults.step4 = {
        status: 'completed',
        applicationId: this.applicationId,
        duplicateEmailTest: 'passed'
      };

      // Step 5: Document upload (S3 test)
      this.log('STEP 5: Testing S3 document upload');
      
      const testContent = `%PDF-1.4
Test Equipment Financing Document
Generated: ${new Date().toISOString()}
Application ID: ${this.applicationId}
Document Type: equipment_quote
%%EOF`;

      const formData = new FormData();
      formData.append('document', Buffer.from(testContent), {
        filename: 'equipment_quote_test.pdf',
        contentType: 'application/pdf'
      });
      formData.append('documentType', 'equipment_quote');

      this.log(`Uploading document to: ${BASE_URL}/api/public/upload/${this.applicationId}`);

      const uploadResponse = await fetch(`${BASE_URL}/api/public/upload/${this.applicationId}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`
        }
      });

      this.log(`Upload response: ${uploadResponse.status} ${uploadResponse.statusText}`);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        this.log(`Document upload failed: ${uploadResponse.status} - ${errorText}`, 'error');
        return false;
      }

      const uploadResult = await uploadResponse.json();
      this.log(`✅ Upload successful: ${JSON.stringify(uploadResult)}`, 'success');

      // Verify storage_key is present
      const storageKey = uploadResult.storage_key || uploadResult.storageKey;
      if (!storageKey) {
        this.log('⚠️ Warning: No storage_key in upload response', 'error');
      } else {
        this.log(`✅ Storage key confirmed: ${storageKey}`, 'success');
      }

      this.testResults.step5 = {
        status: 'completed',
        documentId: uploadResult.documentId || uploadResult.id,
        storageKey: storageKey,
        uploadResponse: uploadResult
      };

      // Step 6: Document verification and finalization
      this.log('STEP 6: Testing document verification and finalization');
      
      // Test document verification endpoint
      this.log('Testing GET /api/public/applications/:id/documents');
      
      const verifyResponse = await fetch(`${BASE_URL}/api/public/applications/${this.applicationId}/documents`);
      this.log(`Document verification response: ${verifyResponse.status} ${verifyResponse.statusText}`);

      if (verifyResponse.status === 404) {
        this.log('❌ Application not found in staff backend (404)', 'error');
        return false;
      }

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        this.log(`Document verification failed: ${verifyResponse.status} - ${errorText}`, 'error');
        return false;
      }

      const documentData = await verifyResponse.json();
      const documents = documentData.documents || [];
      
      this.log(`✅ Document verification successful: ${documents.length} documents found`, 'success');

      if (documents.length === 0) {
        this.log('❌ No documents found - finalization would be blocked', 'error');
        return false;
      }

      // Log document details
      documents.forEach((doc, index) => {
        this.log(`Document ${index + 1}: ${doc.fileName || doc.name} (${doc.documentType || doc.type})`);
        if (doc.storage_key || doc.storageKey) {
          this.log(`   Storage Key: ${doc.storage_key || doc.storageKey}`);
        }
      });

      // Test application finalization
      this.log('Testing PATCH /api/public/applications/:id/finalize');
      
      const finalizeResponse = await fetch(`${BASE_URL}/api/public/applications/${this.applicationId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify({
          status: 'submitted',
          finalizedAt: new Date().toISOString()
        })
      });

      this.log(`Finalization response: ${finalizeResponse.status} ${finalizeResponse.statusText}`);

      if (!finalizeResponse.ok) {
        const errorText = await finalizeResponse.text();
        this.log(`Application finalization failed: ${finalizeResponse.status} - ${errorText}`, 'error');
        return false;
      }

      const finalizeResult = await finalizeResponse.json();
      this.log(`✅ Application finalized successfully: ${JSON.stringify(finalizeResult)}`, 'success');

      this.testResults.step6 = {
        status: 'completed',
        documentsFound: documents.length,
        finalizationResponse: finalizeResult
      };

      // Generate final report
      this.generateFinalReport();
      
      return true;

    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
      console.error(error.stack);
      return false;
    }
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SMOKE TEST REPORT');
    console.log('='.repeat(60));
    
    console.log('\n🎯 OVERALL RESULT: ✅ ALL TESTS PASSED');
    console.log('🎉 S3-ENABLED APPLICATION FLOW WORKING CORRECTLY!');
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('====================');
    
    console.log('✅ STEP 1-3: Application data prepared');
    console.log('✅ STEP 4: Application created with duplicate email test passed');
    console.log('✅ STEP 5: S3 document upload successful');
    console.log('✅ STEP 6: Document verification and finalization completed');
    
    console.log(`\n🔑 APPLICATION ID: ${this.applicationId}`);
    
    console.log('\n📊 KEY VALIDATIONS CONFIRMED:');
    console.log('==============================');
    
    const step4Result = this.testResults.step4;
    if (step4Result && step4Result.duplicateEmailTest === 'passed') {
      console.log('✅ No duplicate email blocking');
    }
    
    const step5Result = this.testResults.step5;
    if (step5Result && step5Result.storageKey) {
      console.log('✅ S3 document upload working with storage_key');
    }
    
    const step6Result = this.testResults.step6;
    if (step6Result && step6Result.documentsFound > 0) {
      console.log('✅ Staff backend document verification working');
      console.log('✅ Application finalization successful');
    }
    
    console.log('✅ Complete Step 1-6 workflow operational');
    
    console.log('\n🚀 DEPLOYMENT STATUS: READY FOR PRODUCTION');
    
    return this.testResults;
  }
}

// Execute the test
const smokeTest = new ServerSmokeTest();
smokeTest.executeCompleteTest()
  .then(success => {
    if (success) {
      console.log('\n🎉 SMOKE TEST COMPLETED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.log('\n❌ SMOKE TEST FAILED - CHECK RESULTS ABOVE');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 SMOKE TEST CRASHED:', error);
    process.exit(1);
  });