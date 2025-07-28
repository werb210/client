/**
 * Real Document S3 Test - Using Actual Banking PDFs
 * Tests complete workflow with real documents from attached_assets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const BEARER_TOKEN = process.env.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token';

console.log('🧪 [REAL DOCS TEST] Starting test with actual banking documents');
console.log('🔧 [REAL DOCS TEST] API Base URL:', API_BASE_URL);

// Get real banking documents from attached_assets
const REAL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

console.log('📋 [REAL DOCS TEST] Will upload these real documents:', REAL_DOCUMENTS);

// Generate application ID
function generateApplicationId() {
  return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Submit application data
async function submitApplication() {
  console.log('📤 [REAL DOCS TEST] Step 1: Creating application...');
  
  const applicationData = {
    step1: {
      fundingAmount: 100000,
      requestedAmount: 100000,
      use_of_funds: "Equipment Purchase",
      businessLocation: "CA",
      selectedCategory: "Equipment Financing"
    },
    step3: {
      operatingName: "S3 Verification Test Corp",
      legalName: "S3 Verification Test Corp",
      businessName: "S3 Verification Test Corp",
      businessPhone: "+1-555-555-3333",
      businessCity: "Calgary", 
      businessState: "AB",
      businessStructure: "Corporation"
    },
    step4: {
      applicantFirstName: "Todd",
      applicantLastName: "Werb",
      applicantEmail: "s3realtest@boreal.financial",
      applicantPhone: "+1-555-555-3333",
      email: "s3realtest@boreal.financial",
      firstName: "Todd",
      lastName: "Werb",
      ownershipPercentage: 100
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify(applicationData)
    });

    console.log('📥 [REAL DOCS TEST] Application response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Application creation failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [REAL DOCS TEST] Application created:', {
      applicationId: result.applicationId,
      status: result.status
    });

    return result.applicationId;
    
  } catch (error) {
    console.error('❌ [REAL DOCS TEST] Application creation failed:', error);
    throw error;
  }
}

// Upload real documents
async function uploadRealDocuments(applicationId) {
  console.log('📤 [REAL DOCS TEST] Step 2: Uploading real banking documents...');
  
  const uploadResults = [];
  let s3SuccessCount = 0;
  let fallbackCount = 0;

  for (const fileName of REAL_DOCUMENTS) {
    console.log(`📄 [REAL DOCS TEST] Processing ${fileName}...`);
    
    try {
      const filePath = path.join(__dirname, 'attached_assets', fileName);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ [REAL DOCS TEST] File not found: ${filePath}`);
        continue;
      }

      const fileStats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`📊 [REAL DOCS TEST] File info: ${fileName} (${fileStats.size} bytes)`);

      // Create FormData with real file
      const formData = new FormData();
      
      formData.append('document', fileBuffer, {
        filename: fileName,
        contentType: 'application/pdf'
      });
      formData.append('documentType', 'bank_statements');

      const response = await fetch(`${API_BASE_URL}/upload/${applicationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      console.log(`📊 [REAL DOCS TEST] Upload response for ${fileName}:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [REAL DOCS TEST] Upload failed for ${fileName}:`, errorText);
        
        // Stop test on S3 failures per requirement
        throw new Error(`❌ S3 UPLOAD FAILED: ${fileName} - ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      // Check for fallback mode
      if (result.fallback || result.documentId?.startsWith('fallback_')) {
        fallbackCount++;
        console.log(`⚠️ [REAL DOCS TEST] FALLBACK MODE: ${fileName} stored locally, not S3`);
        
        // Stop test if fallback detected per requirement  
        throw new Error(`❌ FALLBACK DETECTED: ${fileName} was stored in fallback mode, not S3`);
      } else {
        s3SuccessCount++;
        console.log(`✅ [REAL DOCS TEST] S3 SUCCESS: ${fileName}`, {
          documentId: result.documentId,
          storage_key: result.storage_key
        });
      }

      uploadResults.push({
        fileName,
        documentId: result.documentId,
        storage_key: result.storage_key,
        size: fileStats.size,
        success: true,
        s3Upload: !result.fallback
      });

    } catch (error) {
      console.error(`❌ [REAL DOCS TEST] Failed to upload ${fileName}:`, error);
      throw error;
    }
  }

  console.log('📊 [REAL DOCS TEST] Upload Summary:', {
    totalDocuments: REAL_DOCUMENTS.length,
    uploaded: uploadResults.length,
    s3Successes: s3SuccessCount,
    fallbacks: fallbackCount
  });

  return uploadResults;
}

// Finalize application
async function finalizeApplication(applicationId) {
  console.log('📤 [REAL DOCS TEST] Step 3: Finalizing application...');
  
  const finalizationData = {
    step6: {
      typedName: "Todd Werb",
      signatureType: "typed",
      signedBy: "Todd Werb",
      timestamp: new Date().toISOString(),
      agreements: {
        creditCheck: true,
        dataSharing: true,
        termsAccepted: true,
        electronicSignature: true,
        accurateInformation: true
      }
    },
    applicationId: applicationId
  };

  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      body: JSON.stringify(finalizationData)
    });

    console.log('📊 [REAL DOCS TEST] Finalization response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Finalization failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [REAL DOCS TEST] Application finalized:', {
      applicationId,
      status: result.status,
      finalizedAt: result.finalizedAt
    });

    // Verify status is "submitted"
    if (result.status !== 'submitted') {
      console.warn(`⚠️ [REAL DOCS TEST] Expected status 'submitted', got '${result.status}'`);
    }

    return result;
    
  } catch (error) {
    console.error('❌ [REAL DOCS TEST] Finalization failed:', error);
    throw error;
  }
}

// Main test execution
async function runRealDocumentTest() {
  console.log('🚀 [REAL DOCS TEST] Starting comprehensive test with real banking documents');
  
  const startTime = Date.now();
  let testResult = {
    success: false,
    applicationId: null,
    documentsUploaded: 0,
    s3Uploads: 0,
    fallbacks: 0,
    totalTime: 0,
    error: null
  };
  
  try {
    // Step 1: Submit application
    const applicationId = await submitApplication();
    testResult.applicationId = applicationId;
    console.log('✅ [REAL DOCS TEST] Phase 1 Complete: Application created');
    
    // Step 2: Upload real documents
    const uploadResults = await uploadRealDocuments(applicationId);
    testResult.documentsUploaded = uploadResults.length;
    testResult.s3Uploads = uploadResults.filter(r => r.s3Upload).length;
    testResult.fallbacks = uploadResults.filter(r => !r.s3Upload).length;
    console.log('✅ [REAL DOCS TEST] Phase 2 Complete: Real documents uploaded');
    
    // Step 3: Finalize application
    const finalizationResult = await finalizeApplication(applicationId);
    console.log('✅ [REAL DOCS TEST] Phase 3 Complete: Application finalized');
    
    testResult.success = true;
    testResult.totalTime = Date.now() - startTime;
    
    console.log('🎉 [REAL DOCS TEST] ALL TESTS PASSED WITH REAL DOCUMENTS');
    console.log('📊 [REAL DOCS TEST] Final Results:', testResult);
    
    return testResult;
    
  } catch (error) {
    testResult.totalTime = Date.now() - startTime;
    testResult.error = error.message;
    
    console.error('❌ [REAL DOCS TEST] TEST FAILED:', error);
    console.log('📊 [REAL DOCS TEST] Failure Results:', testResult);
    
    throw error;
  }
}

// Execute test
runRealDocumentTest().catch(error => {
  console.error('❌ [REAL DOCS TEST] Test execution failed:', error);
  process.exit(1);
});