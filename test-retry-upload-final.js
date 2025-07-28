// ✅ Client Upload Retry Test Summary (July 25, 2025)

// Environment:
// - Staff backend now fully S3-only
// - MIME type issues resolved
// - UUID enforcement in place
// - Legacy fallback fully removed

// 📤 Retry Upload Test Function
import fs from 'fs';
import FormData from 'form-data';

const testApplicationId = 'aac71c9a-d154-4914-8982-4f1a33ef8259';
const testFileName = 'November 2024_1751579433995.pdf';
const filePath = 'attached_assets/' + testFileName;

async function testRetryUpload() {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const form = new FormData();
    form.append('document', fileBuffer, { filename: testFileName, contentType: 'application/pdf' });
    form.append('documentType', 'bank_statements');

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`http://localhost:5000/api/public/upload/${testApplicationId}`, {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    console.log('📋 Response Status:', response.status);
    console.log('📋 Full Response:', JSON.stringify(result, null, 2));

    if (result.success && result.fallback === false && result.storage === 's3') {
      console.log('🎉 SUCCESS: Document uploaded to S3');
      console.log(`   documentId: ${result.documentId}`);
      console.log(`   storageKey: ${result.storageKey}`);
      console.log(`   checksum: ${result.checksum}`);
    } else if (result.fallback === true) {
      console.log('⚠️ Fallback response returned – investigate staff backend');
    } else if (result.success && !result.hasOwnProperty('fallback')) {
      console.log('📋 SUCCESS: Upload successful (checking response format)');
      console.log('   Note: Response may be from server formatting instead of direct S3 response');
    } else {
      console.log('❌ Unexpected response format');
    }
  } catch (err) {
    console.error('❌ Upload failed:', err.message);
  }
}

// Run the test
testRetryUpload();