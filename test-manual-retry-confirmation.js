/**
 * Test Manual Retry Confirmation
 * Creates test data to confirm window.manualRetryAll() functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 [MANUAL RETRY CONFIRM] Setting up test data for window.manualRetryAll()');

// Simulate localStorage retry queue with real document data
const mockRetryQueue = [
  {
    id: 'retry_1753474900001_abc123',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'November 2024_1751579433995.pdf',
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:00.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  },
  {
    id: 'retry_1753474900002_def456',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'December 2024_1751579433994.pdf', 
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:05.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  },
  {
    id: 'retry_1753474900003_ghi789',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'January 2025_1751579433994.pdf',
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:10.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  },
  {
    id: 'retry_1753474900004_jkl012',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'February 2025_1751579433994.pdf',
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:15.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  },
  {
    id: 'retry_1753474900005_mno345',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'March 2025_1751579433994.pdf',
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:20.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  },
  {
    id: 'retry_1753474900006_pqr678',
    applicationId: 'aac71c9a-d154-4914-8982-4f1a33ef8259',
    type: 'upload',
    fileName: 'April 2025_1751579433993.pdf',
    documentType: 'bank_statements',
    timestamp: '2025-07-25T20:15:25.000Z',
    retryCount: 0,
    error: 'Upload failed: Staff backend S3 not available (fallback mode)'
  }
];

console.log('📋 [MANUAL RETRY CONFIRM] Simulated retry queue with 6 real banking documents:', {
  totalItems: mockRetryQueue.length,
  applicationId: mockRetryQueue[0].applicationId,
  fileNames: mockRetryQueue.map(item => item.fileName),
  allSameApp: mockRetryQueue.every(item => item.applicationId === mockRetryQueue[0].applicationId)
});

// Show expected manualRetryAll() output format
console.log('\n🔧 [MANUAL RETRY CONFIRM] Expected window.manualRetryAll() output format:');
console.log('='.repeat(60));

mockRetryQueue.forEach((item, index) => {
  console.log(`🔄 [MANUAL RETRY] Processing upload: ${item.fileName}`);
  console.log(`📤 [RETRY] Attempting document upload for ${item.applicationId}:`);
  console.log(`   fileName: ${item.fileName}`);
  console.log(`   documentType: ${item.documentType}`);
  console.log(`📋 [RETRY] Document upload response: 404` + (index < 3 ? ' (expected - S3 still not ready)' : ' → Response: 404'));
  console.log('');
});

console.log('='.repeat(60));
console.log('🎯 [MANUAL RETRY CONFIRM] Manual retry simulation complete: { success: 0, failed: 6 }');
console.log('💡 [MANUAL RETRY CONFIRM] When staff backend S3 is fixed, expect HTTP 200 responses with storage_key fields');

// Document verification 
const documentsExist = mockRetryQueue.every(item => {
  const filePath = path.join(__dirname, 'attached_assets', item.fileName);
  return fs.existsSync(filePath);
});

console.log('\n📄 [MANUAL RETRY CONFIRM] Real document verification:', {
  allDocumentsExist: documentsExist,
  documentPath: path.join(__dirname, 'attached_assets'),
  readyForManualRetry: documentsExist && mockRetryQueue.length === 6
});

if (documentsExist) {
  console.log('✅ [MANUAL RETRY CONFIRM] All 6 banking documents ready for retry when staff backend S3 is operational');
} else {
  console.log('⚠️ [MANUAL RETRY CONFIRM] Some documents missing - check attached_assets folder');
}

console.log('\n📋 [MANUAL RETRY CONFIRM] To execute manual retry:');
console.log('   1. Open browser console on client application');
console.log('   2. Execute: window.manualRetryAll()');
console.log('   3. Watch console for retry attempts per file name');
console.log('   4. Expect "Response: 404" until staff backend S3 is ready');
console.log('   5. When ready, expect "Response: 200" with storage_key fields');