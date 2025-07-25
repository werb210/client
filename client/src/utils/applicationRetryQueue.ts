/**
 * ✅ APPLICATION RETRY QUEUE SYSTEM
 * Stores failed application POST and upload attempts for retry when staff API is available
 */

import { logger } from '@/lib/utils';

export interface QueuedApplication {
  id: string;
  applicationId: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
  type: 'application' | 'upload' | 'finalization';
  fileName?: string; // For upload attempts
  documentType?: string; // For upload attempts
  file?: File; // For upload attempts
}

const STORAGE_KEY = 'boreal_application_retry_queue';
const MAX_RETRY_ATTEMPTS = 5;

/**
 * Add failed application/upload attempt to retry queue
 */
export function addToRetryQueue(item: Omit<QueuedApplication, 'id' | 'timestamp' | 'retryCount'>): void {
  try {
    const queue = getRetryQueue();
    const queueItem: QueuedApplication = {
      ...item,
      id: `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    queue.push(queueItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    
    logger.log(`🔄 [RETRY QUEUE] Added ${item.type} to retry queue:`, {
      applicationId: item.applicationId,
      type: item.type,
      fileName: item.fileName,
      queueSize: queue.length
    });
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to add item to queue:', error);
  }
}

/**
 * Get all items in retry queue
 */
export function getRetryQueue(): QueuedApplication[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to read queue:', error);
    return [];
  }
}

/**
 * Remove item from retry queue
 */
export function removeFromRetryQueue(itemId: string): void {
  try {
    const queue = getRetryQueue();
    const updatedQueue = queue.filter(item => item.id !== itemId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
    
    logger.log(`✅ [RETRY QUEUE] Removed item from queue:`, { itemId, remainingItems: updatedQueue.length });
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to remove item:', error);
  }
}

/**
 * Update retry attempt for item
 */
export function updateRetryAttempt(itemId: string, error?: string): void {
  try {
    const queue = getRetryQueue();
    const itemIndex = queue.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      queue[itemIndex].retryCount += 1;
      queue[itemIndex].lastAttempt = new Date().toISOString();
      if (error) queue[itemIndex].error = error;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      
      logger.log(`🔄 [RETRY QUEUE] Updated retry attempt:`, {
        itemId,
        retryCount: queue[itemIndex].retryCount,
        error
      });
    }
  } catch (error) {
    console.error('❌ [RETRY QUEUE] Failed to update retry attempt:', error);
  }
}

/**
 * Get pending retry count
 */
export function getPendingRetryCount(): number {
  return getRetryQueue().length;
}

/**
 * Get retry queue summary for UI display
 */
export function getRetryQueueSummary(): {
  total: number;
  applications: number;
  uploads: number;
  finalizations: number;
} {
  const queue = getRetryQueue();
  
  return {
    total: queue.length,
    applications: queue.filter(item => item.type === 'application').length,
    uploads: queue.filter(item => item.type === 'upload').length,
    finalizations: queue.filter(item => item.type === 'finalization').length
  };
}

/**
 * Check if staff API is healthy
 */
export async function checkStaffAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://staff.boreal.financial/api/health');
    return response.ok;
  } catch (error) {
    console.warn('🔍 [HEALTH CHECK] Staff API health check failed:', error);
    return false;
  }
}

/**
 * Process retry queue when API is available
 */
export async function processRetryQueue(): Promise<{ success: number; failed: number }> {
  const queue = getRetryQueue();
  let successCount = 0;
  let failedCount = 0;
  
  if (queue.length === 0) {
    logger.log('🔄 [RETRY QUEUE] No items to retry');
    return { success: 0, failed: 0 };
  }
  
  logger.log(`🔄 [RETRY QUEUE] Processing ${queue.length} queued items...`);
  
  // Check API health first
  const isHealthy = await checkStaffAPIHealth();
  if (!isHealthy) {
    logger.log('⚠️ [RETRY QUEUE] Staff API not healthy, skipping retry');
    return { success: 0, failed: 0 };
  }
  
  for (const item of queue) {
    if (item.retryCount >= MAX_RETRY_ATTEMPTS) {
      logger.log(`❌ [RETRY QUEUE] Max retries exceeded for item:`, item.id);
      removeFromRetryQueue(item.id);
      failedCount++;
      continue;
    }
    
    try {
      const success = await retryQueuedItem(item);
      if (success) {
        removeFromRetryQueue(item.id);
        successCount++;
        logger.log(`✅ [RETRY QUEUE] Successfully processed:`, {
          type: item.type,
          applicationId: item.applicationId,
          fileName: item.fileName
        });
      } else {
        updateRetryAttempt(item.id, 'Retry failed');
        failedCount++;
      }
    } catch (error) {
      updateRetryAttempt(item.id, error instanceof Error ? error.message : 'Unknown error');
      failedCount++;
      logger.log(`❌ [RETRY QUEUE] Failed to process item:`, {
        itemId: item.id,
        error: error instanceof Error ? error.message : error
      });
    }
  }
  
  logger.log(`🎯 [RETRY QUEUE] Processing complete:`, { success: successCount, failed: failedCount });
  return { success: successCount, failed: failedCount };
}

/**
 * Retry individual queued item
 */
async function retryQueuedItem(item: QueuedApplication): Promise<boolean> {
  try {
    switch (item.type) {
      case 'application':
        return await retryApplicationCreation(item);
      case 'upload':
        return await retryDocumentUpload(item);
      case 'finalization':
        return await retryApplicationFinalization(item);
      default:
        logger.log(`❌ [RETRY QUEUE] Unknown item type:`, item.type);
        return false;
    }
  } catch (error) {
    logger.log(`❌ [RETRY QUEUE] Error retrying item:`, error);
    return false;
  }
}

/**
 * Retry application creation
 */
async function retryApplicationCreation(item: QueuedApplication): Promise<boolean> {
  const response = await fetch('https://staff.boreal.financial/api/public/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: JSON.stringify(item.payload)
  });
  
  return response.ok;
}

/**
 * Retry document upload
 */
async function retryDocumentUpload(item: QueuedApplication): Promise<boolean> {
  if (!item.file || !item.documentType) {
    logger.log(`❌ [RETRY QUEUE] Missing file or documentType for upload retry`);
    return false;
  }
  
  const formData = new FormData();
  formData.append('document', item.file);
  formData.append('documentType', item.documentType);
  
  const response = await fetch(`https://staff.boreal.financial/api/public/upload/${item.applicationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: formData
  });
  
  return response.ok;
}

/**
 * Retry application finalization
 */
async function retryApplicationFinalization(item: QueuedApplication): Promise<boolean> {
  const response = await fetch(`https://staff.boreal.financial/api/public/applications/${item.applicationId}/finalize`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    },
    body: JSON.stringify(item.payload || {})
  });
  
  return response.ok;
}

/**
 * Manual retry function for debugging - accessible via window.manualRetryAll()
 */
export const manualRetryAll = async (): Promise<void> => {
  console.log('🔧 [MANUAL RETRY] Starting manual retry of all queued items');
  
  const result = await processRetryQueue();
  console.log('🔧 [MANUAL RETRY] Manual retry complete:', result);
};

/**
 * Add to global window for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).manualRetryAll = manualRetryAll;
  (window as any).getRetryQueue = getRetryQueue;
  (window as any).getRetryQueueSummary = getRetryQueueSummary;
}

/**
 * Export debug logs for staff support
 */
export function exportDebugLogs(): string {
  const queue = getRetryQueue();
  const summary = getRetryQueueSummary();
  
  const debugData = {
    timestamp: new Date().toISOString(),
    summary,
    queueItems: queue.map(item => ({
      id: item.id,
      applicationId: item.applicationId,
      type: item.type,
      timestamp: item.timestamp,
      retryCount: item.retryCount,
      lastAttempt: item.lastAttempt,
      error: item.error,
      fileName: item.fileName,
      documentType: item.documentType
    })),
    system: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL
    }
  };
  
  return JSON.stringify(debugData, null, 2);
}

/**
 * Clear all retry queue items (for debugging)
 */
export function clearRetryQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
  logger.log('🗑️ [RETRY QUEUE] Cleared all retry queue items');
}