/**
 * Real Document S3 Test using curl commands
 * Tests complete workflow with real documents using server-side approach
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api/public';
const BEARER_TOKEN = 'VITE_CLIENT_APP_SHARED_TOKEN=ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042';

console.log('🧪 [CURL TEST] Starting comprehensive S3 test with real banking documents');

// Real banking documents from attached_assets
const REAL_DOCUMENTS = [
  'November 2024_1751579433995.pdf',
  'December 2024_1751579433994.pdf', 
  'January 2025_1751579433994.pdf',
  'February 2025_1751579433994.pdf',
  'March 2025_1751579433994.pdf',
  'April 2025_1751579433993.pdf'
];

// Step 1: Create application
function createApplication() {
  console.log('📤 [CURL TEST] Step 1: Creating application...');

  const applicationData = {
    step1: {
      fundingAmount: 100000,
      requestedAmount: 100000,
      use_of_funds: "Equipment Purchase",
      businessLocation: "CA",
      selectedCategory: "Equipment Financing"
    },
    step3: {
      operatingName: "S3 Real Test Corporation",
      legalName: "S3 Real Test Corporation",  
      businessName: "S3 Real Test Corporation",
      businessPhone: "+1-555-555-4444",
      businessCity: "Calgary",
      businessState: "AB",
      businessStructure: "Corporation"
    },
    step4: {
      applicantFirstName: "Todd",
      applicantLastName: "Werb",
      applicantEmail: "s3curltest@boreal.financial",
      applicantPhone: "+1-555-555-4444",
      email: "s3curltest@boreal.financial",
      firstName: "Todd",
      lastName: "Werb",
      ownershipPercentage: 100
    }
  };

  const curlCommand = `curl -s -X POST "${API_BASE_URL}/applications" \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${BEARER_TOKEN}" \\
    -d '${JSON.stringify(applicationData)}'`;

  try {
    const result = execSync(curlCommand, { encoding: 'utf8' });
    const response = JSON.parse(result);
    
    console.log('✅ [CURL TEST] Application created:', {
      applicationId: response.applicationId,
      status: response.status
    });

    return response.applicationId;
  } catch (error) {
    console.error('❌ [CURL TEST] Application creation failed:', error.message);
    throw error;
  }
}

// Step 2: Upload real documents
function uploadRealDocuments(applicationId) {
  console.log('📤 [CURL TEST] Step 2: Uploading real banking documents...');

  const uploadResults = [];
  let s3SuccessCount = 0;
  let fallbackCount = 0;

  for (const fileName of REAL_DOCUMENTS) {
    console.log(`📄 [CURL TEST] Uploading ${fileName}...`);

    const filePath = path.join(__dirname, 'attached_assets', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [CURL TEST] File not found: ${filePath}`);
      continue;
    }

    const fileStats = fs.statSync(filePath);
    console.log(`📊 [CURL TEST] File info: ${fileName} (${fileStats.size} bytes)`);

    const curlCommand = `curl -s -X POST "${API_BASE_URL}/upload/${applicationId}" \\
      -H "Authorization: Bearer ${BEARER_TOKEN}" \\
      -F "document=@${filePath}" \\
      -F "documentType=bank_statements"`;

    try {
      const result = execSync(curlCommand, { encoding: 'utf8' });
      console.log(`📊 [CURL TEST] Raw response for ${fileName}:`, result);
      
      const response = JSON.parse(result);

      // Check for fallback mode
      if (response.fallback || response.documentId?.startsWith('fallback_')) {
        fallbackCount++;
        console.log(`⚠️ [CURL TEST] FALLBACK MODE: ${fileName} stored locally, not S3`);
        
        // Stop test if fallback detected per requirement  
        throw new Error(`❌ FALLBACK DETECTED: ${fileName} was stored in fallback mode, not S3`);
      } else {
        s3SuccessCount++;
        console.log(`✅ [CURL TEST] S3 SUCCESS: ${fileName}`, {
          documentId: response.documentId,
          storage_key: response.storage_key
        });
      }

      uploadResults.push({
        fileName,
        documentId: response.documentId,
        storage_key: response.storage_key,
        size: fileStats.size,
        success: true,
        s3Upload: !response.fallback
      });

    } catch (error) {
      console.error(`❌ [CURL TEST] Failed to upload ${fileName}:`, error.message);
      throw error;
    }
  }

  console.log('📊 [CURL TEST] Upload Summary:', {
    totalDocuments: REAL_DOCUMENTS.length,
    uploaded: uploadResults.length,
    s3Successes: s3SuccessCount,
    fallbacks: fallbackCount
  });

  return uploadResults;
}

// Step 3: Finalize application
function finalizeApplication(applicationId) {
  console.log('📤 [CURL TEST] Step 3: Finalizing application...');

  const finalizationData = {
    step1: {
      fundingAmount: 100000,
      requestedAmount: 100000,
      use_of_funds: "Equipment Purchase"
    },
    step3: {
      operatingName: "S3 Real Test Corporation",
      businessPhone: "+1-555-555-4444"
    },
    step4: {
      applicantFirstName: "Todd",
      applicantLastName: "Werb",
      applicantEmail: "s3curltest@boreal.financial"
    },
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

  const curlCommand = `curl -s -X PATCH "${API_BASE_URL}/applications/${applicationId}/finalize" \\
    -H "Content-Type: application/json" \\
    -H "Authorization: Bearer ${BEARER_TOKEN}" \\
    -d '${JSON.stringify(finalizationData)}'`;

  try {
    const result = execSync(curlCommand, { encoding: 'utf8' });
    const response = JSON.parse(result);
    
    console.log('✅ [CURL TEST] Application finalized:', {
      applicationId,
      status: response.status,
      finalizedAt: response.finalizedAt
    });

    // Verify status is "submitted"
    if (response.status !== 'submitted') {
      console.warn(`⚠️ [CURL TEST] Expected status 'submitted', got '${response.status}'`);
    }

    return response;
  } catch (error) {
    console.error('❌ [CURL TEST] Finalization failed:', error.message);
    throw error;
  }
}

// Main test execution
function runCurlTest() {
  console.log('🚀 [CURL TEST] Starting comprehensive test with real banking documents');
  
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
    const applicationId = createApplication();
    testResult.applicationId = applicationId;
    console.log('✅ [CURL TEST] Phase 1 Complete: Application created');
    
    // Step 2: Upload real documents
    const uploadResults = uploadRealDocuments(applicationId);
    testResult.documentsUploaded = uploadResults.length;
    testResult.s3Uploads = uploadResults.filter(r => r.s3Upload).length;
    testResult.fallbacks = uploadResults.filter(r => !r.s3Upload).length;
    console.log('✅ [CURL TEST] Phase 2 Complete: Real documents uploaded');
    
    // Step 3: Finalize application
    const finalizationResult = finalizeApplication(applicationId);
    console.log('✅ [CURL TEST] Phase 3 Complete: Application finalized');
    
    testResult.success = true;
    testResult.totalTime = Date.now() - startTime;
    
    console.log('🎉 [CURL TEST] ALL TESTS PASSED WITH REAL DOCUMENTS');
    console.log('📊 [CURL TEST] Final Results:', testResult);
    
    return testResult;
    
  } catch (error) {
    testResult.totalTime = Date.now() - startTime;
    testResult.error = error.message;
    
    console.error('❌ [CURL TEST] TEST FAILED:', error.message);
    console.log('📊 [CURL TEST] Failure Results:', testResult);
    
    throw error;
  }
}

// Execute test
try {
  runCurlTest();
} catch (error) {
  console.error('❌ [CURL TEST] Test execution failed:', error.message);
  process.exit(1);
}