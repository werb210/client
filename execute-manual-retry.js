/**
 * Execute Manual Retry - Simulate window.manualRetryAll() execution
 * This script simulates what happens when window.manualRetryAll() is called
 */

// Simulate localStorage for testing
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Mock environment variables
const mockEnv = {
  VITE_CLIENT_APP_SHARED_TOKEN: 'ae2dd3089a06aa32157abd1b997a392836059ba3d47dca79cff0660c09f95042'
};

// Simulate the retry queue functionality
async function simulateManualRetryAll() {
  console.log('🔧 [MANUAL RETRY] Starting manual retry of all queued items');
  
  // Check for queued items in localStorage
  const queueData = mockLocalStorage.getItem('boreal_application_retry_queue');
  const queue = queueData ? JSON.parse(queueData) : [];
  
  console.log(`📋 [MANUAL RETRY] Found ${queue.length} items in retry queue`);
  
  if (queue.length === 0) {
    console.log('✅ [MANUAL RETRY] No items in queue to retry');
    return { success: 0, failed: 0 };
  }
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const item of queue) {
    console.log(`🔄 [MANUAL RETRY] Processing ${item.type}:`, {
      applicationId: item.applicationId,
      fileName: item.fileName,
      documentType: item.documentType,
      retryCount: item.retryCount
    });
    
    try {
      let success = false;
      
      switch (item.type) {
        case 'application':
          success = await retryApplicationCreation(item);
          break;
        case 'upload':
          success = await retryDocumentUpload(item);
          break;
        case 'finalization':
          success = await retryApplicationFinalization(item);
          break;
        default:
          console.log(`❌ [MANUAL RETRY] Unknown item type: ${item.type}`);
          break;
      }
      
      if (success) {
        successCount++;
        console.log(`✅ [MANUAL RETRY] Successfully processed ${item.type}:`, {
          applicationId: item.applicationId,
          fileName: item.fileName
        });
      } else {
        failedCount++;
        console.log(`❌ [MANUAL RETRY] Failed to process ${item.type}:`, {
          applicationId: item.applicationId,
          fileName: item.fileName
        });
      }
      
    } catch (error) {
      failedCount++;
      console.error(`❌ [MANUAL RETRY] Error processing ${item.type}:`, error.message);
    }
  }
  
  const result = { success: successCount, failed: failedCount };
  console.log('🔧 [MANUAL RETRY] Manual retry complete:', result);
  return result;
}

// Retry functions (similar to the actual implementation)
async function retryApplicationCreation(item) {
  console.log(`📤 [RETRY] Attempting application creation for ${item.applicationId}`);
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockEnv.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(item.payload)
    });
    
    console.log(`📋 [RETRY] Application creation response: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`❌ [RETRY] Application creation failed:`, error.message);
    return false;
  }
}

async function retryDocumentUpload(item) {
  console.log(`📤 [RETRY] Attempting document upload for ${item.applicationId}:`, {
    fileName: item.fileName,
    documentType: item.documentType
  });
  
  // Note: In real implementation, we would have the actual File object
  // For simulation, we'll just test the endpoint availability
  try {
    const response = await fetch(`https://staff.boreal.financial/api/public/upload/${item.applicationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mockEnv.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      // In real scenario: body would contain FormData with file
      body: new FormData() // Empty for endpoint test
    });
    
    console.log(`📋 [RETRY] Document upload response: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [RETRY] Document upload success:`, {
        documentId: data.documentId,
        storage_key: data.storage_key,
        s3Upload: !data.fallback
      });
      
      // Check if this was a real S3 upload vs fallback
      if (data.fallback) {
        console.log(`⚠️ [RETRY] Upload still in fallback mode, S3 not ready`);
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ [RETRY] Document upload failed:`, error.message);
    return false;
  }
}

async function retryApplicationFinalization(item) {
  console.log(`📤 [RETRY] Attempting finalization for ${item.applicationId}`);
  
  try {
    const response = await fetch(`https://staff.boreal.financial/api/public/applications/${item.applicationId}/finalize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockEnv.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(item.payload || {})
    });
    
    console.log(`📋 [RETRY] Finalization response: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.error(`❌ [RETRY] Finalization failed:`, error.message);
    return false;
  }
}

// Execute the manual retry simulation
console.log('🚀 [SIMULATION] Executing window.manualRetryAll() simulation');
simulateManualRetryAll()
  .then(result => {
    console.log('🎯 [SIMULATION] Manual retry simulation complete:', result);
  })
  .catch(error => {
    console.error('❌ [SIMULATION] Manual retry simulation failed:', error);
  });