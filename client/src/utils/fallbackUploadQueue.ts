/**
 * ✅ FALLBACK UPLOAD QUEUE SYSTEM
 * Handles retry queue for documents that failed to upload to S3
 */

export interface FallbackUpload {
  id: string;
  file: File;
  documentType: string;
  applicationId: string;
  originalAttemptTime: string;
  retryCount: number;
  documentId: string; // fallback document ID
  fileName: string;
}

const FALLBACK_QUEUE_KEY = 'fallbackUploadsQueue';
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 30000; // 30 seconds

let retryWorkerRunning = false;

/**
 * Add a document to the fallback retry queue
 */
export function queueFallbackUpload(docInfo: Omit<FallbackUpload, 'id' | 'retryCount' | 'originalAttemptTime'>): void {
  const fallbackUpload: FallbackUpload = {
    ...docInfo,
    id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    retryCount: 0,
    originalAttemptTime: new Date().toISOString()
  };

  console.log(`🔄 [FALLBACK-QUEUE] Adding to retry queue:`, {
    fileName: fallbackUpload.fileName,
    documentType: fallbackUpload.documentType,
    applicationId: fallbackUpload.applicationId
  });

  const queue = getFallbackQueue();
  queue.push(fallbackUpload);
  saveFallbackQueue(queue);
  
  // Start background retry worker if not already running
  startRetryWorker();
}

/**
 * Get current fallback queue from localStorage
 */
export function getFallbackQueue(): FallbackUpload[] {
  try {
    const queueData = localStorage.getItem(FALLBACK_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error('❌ [FALLBACK-QUEUE] Error reading queue:', error);
    return [];
  }
}

/**
 * Save fallback queue to localStorage
 */
function saveFallbackQueue(queue: FallbackUpload[]): void {
  try {
    localStorage.setItem(FALLBACK_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('❌ [FALLBACK-QUEUE] Error saving queue:', error);
  }
}

/**
 * Remove a document from the fallback queue (successful retry)
 */
export function removeFromFallbackQueue(documentId: string): void {
  const queue = getFallbackQueue();
  const filteredQueue = queue.filter(item => item.documentId !== documentId);
  saveFallbackQueue(filteredQueue);
  
  console.log(`✅ [FALLBACK-QUEUE] Removed from queue: ${documentId}`);
}

/**
 * Get count of documents in fallback mode for current application
 */
export function getFallbackDocumentCount(applicationId: string): number {
  const queue = getFallbackQueue();
  return queue.filter(item => item.applicationId === applicationId).length;
}

/**
 * Check if any documents are in fallback mode for given application
 */
export function hasFallbackDocuments(applicationId: string): boolean {
  return getFallbackDocumentCount(applicationId) > 0;
}

/**
 * Get list of fallback documents for display in UI
 */
export function getFallbackDocuments(applicationId: string): FallbackUpload[] {
  const queue = getFallbackQueue();
  return queue.filter(item => item.applicationId === applicationId);
}

/**
 * Start background retry worker (runs every 30 seconds)
 */
function startRetryWorker(): void {
  if (retryWorkerRunning) return;
  
  retryWorkerRunning = true;
  console.log('🔄 [FALLBACK-QUEUE] Starting background retry worker...');
  
  const worker = setInterval(async () => {
    await processRetryQueue();
    
    // Stop worker if queue is empty
    const queue = getFallbackQueue();
    if (queue.length === 0) {
      clearInterval(worker);
      retryWorkerRunning = false;
      console.log('✅ [FALLBACK-QUEUE] Retry worker stopped - queue empty');
    }
  }, RETRY_INTERVAL_MS);
}

/**
 * Process retry queue - attempt to re-upload failed documents
 */
async function processRetryQueue(): Promise<void> {
  const queue = getFallbackQueue();
  if (queue.length === 0) return;
  
  console.log(`🔄 [FALLBACK-QUEUE] Processing ${queue.length} items in retry queue...`);
  
  for (const item of queue) {
    if (item.retryCount >= MAX_RETRY_ATTEMPTS) {
      console.warn(`⚠️ [FALLBACK-QUEUE] Max retries exceeded for ${item.fileName}`);
      continue;
    }
    
    try {
      // Attempt re-upload using the original upload function
      const uploadModule = await import('./uploadDocument');
      const result = await uploadModule.default(item.file, item.documentType, item.applicationId);
      
      if (result.success && !result.fallback) {
        console.log(`✅ [FALLBACK-QUEUE] Retry successful: ${item.fileName}`);
        removeFromFallbackQueue(item.documentId);
        
        // TODO: Update UI to show successful retry
        // This would require a global event system or context update
      }
    } catch (error) {
      console.error(`❌ [FALLBACK-QUEUE] Retry failed for ${item.fileName}:`, error);
      
      // Increment retry count
      item.retryCount++;
      const updatedQueue = queue.map(q => q.id === item.id ? item : q);
      saveFallbackQueue(updatedQueue);
    }
  }
}

/**
 * Clear all fallback uploads for a specific application (use after successful submission)
 */
export function clearFallbackQueue(applicationId?: string): void {
  if (applicationId) {
    const queue = getFallbackQueue();
    const filteredQueue = queue.filter(item => item.applicationId !== applicationId);
    saveFallbackQueue(filteredQueue);
    console.log(`🧹 [FALLBACK-QUEUE] Cleared queue for application: ${applicationId}`);
  } else {
    localStorage.removeItem(FALLBACK_QUEUE_KEY);
    console.log('🧹 [FALLBACK-QUEUE] Cleared entire queue');
  }
}