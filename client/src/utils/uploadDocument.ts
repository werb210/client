/**
 * Upload Document Utility - S3 Integration via Staff Backend
 * Handles file uploads to staff backend which manages S3 storage
 */

import { validateApplicationIdForAPI, getStoredApplicationId } from '@/lib/uuidUtils';
import { addToRetryQueue } from '@/utils/applicationRetryQueue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';

export interface UploadResponse {
  success: boolean;
  documentId: string;
  storage_key?: string; // Optional for fallback responses
  fileName: string;
  fileSize: number;
  documentType: string;
  message?: string;
  fallback?: boolean; // ✅ Add fallback flag to interface
}

export interface UploadError {
  success: false;
  error: string;
  message: string;
}

/**
 * Upload a document to the staff backend for S3 storage
 * @param file - The file to upload
 * @param documentType - The type of document (e.g., 'bank_statements')
 * @param applicationId - The application ID
 * @returns Upload response with storage_key and document details
 */
export default async function uploadDocument(
  file: File,
  documentType: string,
  applicationId: string
): Promise<UploadResponse> {
  // Validate application ID before upload
  const validatedApplicationId = validateApplicationIdForAPI(applicationId);
  
  // Additional check against stored ID for consistency
  const storedApplicationId = getStoredApplicationId();
  if (storedApplicationId && storedApplicationId !== validatedApplicationId) {
    throw new Error('Application ID mismatch detected. Please restart the application.');
  }
  
  console.log(`📤 [UPLOAD] Starting upload: ${file.name} (${documentType}) for application ${validatedApplicationId}`);
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('document', file);  // user-selected file (server expects 'document' field)
    formData.append('documentType', documentType); // e.g. 'bank_statements'
    
    // Enhanced dev mode logging
    if (import.meta.env.DEV) {
      console.log('🔧 [UPLOAD] Development mode: Enhanced upload logging');
      console.log(`📋 [UPLOAD] FormData prepared:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: documentType,
        endpoint: `${API_BASE_URL}/api/applications/${validatedApplicationId}/documents`,
        bearerToken: import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ? '✅ Present' : '❌ Missing',
        apiBaseUrl: API_BASE_URL,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`📋 [UPLOAD] FormData prepared:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        documentType: documentType,
        endpoint: `${API_BASE_URL}/api/applications/${applicationId}/documents`
      });
    }

    // Upload to staff backend
    const response = await fetch(`${API_BASE_URL}/api/applications/${validatedApplicationId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });

    if (import.meta.env.DEV) {
      console.log(`🔧 [UPLOAD] Development mode: Enhanced response logging`);
      console.log(`📊 [UPLOAD] Response status: ${response.status} ${response.statusText}`, {
        responseHeaders: Object.fromEntries(response.headers.entries()),
        url: response.url,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`📊 [UPLOAD] Response status: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (import.meta.env.DEV) {
        console.error(`❌ [UPLOAD] Upload failed - Enhanced error details:`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        });
      } else {
        console.error(`❌ [UPLOAD] Upload failed:`, errorText);
      }
      
      // Add failed upload to retry queue
      addToRetryQueue({
        applicationId: validatedApplicationId,
        payload: { documentType },
        type: 'upload',
        fileName: file.name,
        documentType,
        file,
        error: `${response.status} ${response.statusText}: ${errorText}`
      });
      
      console.log(`🔄 [RETRY QUEUE] Added failed upload to retry queue:`, {
        fileName: file.name,
        documentType,
        applicationId: validatedApplicationId
      });
      
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // ✅ CRITICAL: Detect fallback mode and handle appropriately
    const isFallbackMode = result.fallback === true || result.documentId?.startsWith('fallback_');
    
    if (import.meta.env.DEV) {
      console.log(`📊 [UPLOAD] Upload response - Enhanced details:`, {
        ...result,
        responseMetadata: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.log(`📊 [UPLOAD] Upload response:`, result);
    }
    
    // ❌ DISABLE SILENT FALLBACK: Add to retry queue instead of fake success
    if (isFallbackMode) {
      console.log(`🔄 [UPLOAD] Fallback mode detected - adding to retry queue`, {
        documentId: result.documentId,
        fileName: file.name,
        documentType,
        fallbackMode: true
      });
      
      // Add failed upload to retry queue
      addToRetryQueue({
        applicationId: validatedApplicationId,
        payload: { documentType },
        type: 'upload',
        fileName: file.name,
        documentType,
        file,
        error: "Upload failed: Staff backend S3 not available (fallback mode)"
      });
      
      // Return failure with fallback flag for UI notification
      return {
        success: false,
        fallback: true,
        documentId: result.documentId,
        fileName: file.name,
        fileSize: file.size,
        documentType,
        message: "Document stored locally - will retry when staff backend S3 is available",
        storage_key: undefined // No S3 storage key in fallback mode
      };
    }

    // Validate response contains required fields for real S3 uploads
    if (!result.storage_key) {
      console.warn(`⚠️ [UPLOAD] Warning: No storage_key in S3 response:`, result);
    }

    return {
      success: true,
      documentId: result.documentId || result.id,
      storage_key: result.storage_key || result.storageKey,
      fileName: result.fileName || file.name,
      fileSize: result.fileSize || file.size,
      documentType: result.documentType || documentType,
      message: result.message,
      fallback: isFallbackMode // ✅ Pass fallback flag to caller
    };

  } catch (error) {
    console.error(`❌ [UPLOAD] Upload error:`, error);
    
    // Add network/fetch errors to retry queue
    if (error instanceof Error && !error.message.includes('Upload failed:')) {
      addToRetryQueue({
        applicationId: validatedApplicationId,
        payload: { documentType },
        type: 'upload',
        fileName: file.name,
        documentType,
        file,
        error: error.message
      });
      
      console.log(`🔄 [RETRY QUEUE] Added network upload error to retry queue:`, {
        fileName: file.name,
        documentType,
        applicationId: validatedApplicationId,
        error: error.message
      });
    }
    
    throw error;
  }
}

/**
 * Get pre-signed URL for document preview/download
 * @param documentId - The document ID
 * @returns Pre-signed S3 URL for access
 */
export async function getDocumentAccessUrl(documentId: string): Promise<string> {
  console.log(`🔗 [ACCESS] Getting access URL for document: ${documentId}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/public/s3-access/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ACCESS] Failed to get access URL:`, errorText);
      throw new Error(`Failed to get access URL: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ [ACCESS] Access URL obtained:`, { 
      documentId, 
      hasUrl: !!result.url,
      urlLength: result.url?.length 
    });

    return result.url;

  } catch (error) {
    console.error(`❌ [ACCESS] Access URL error:`, error);
    throw error;
  }
}

/**
 * Preview a document by opening it in a new tab
 * @param documentId - The document ID
 */
export async function previewDocument(documentId: string): Promise<void> {
  try {
    console.log(`👁️ [PREVIEW] Opening preview for document: ${documentId}`);
    const url = await getDocumentAccessUrl(documentId);
    window.open(url, '_blank');
    console.log(`✅ [PREVIEW] Preview opened successfully`);
  } catch (error) {
    console.error(`❌ [PREVIEW] Preview failed:`, error);
    throw error;
  }
}

/**
 * Download a document
 * @param documentId - The document ID
 * @param fileName - Optional filename for download
 */
export async function downloadDocument(documentId: string, fileName?: string): Promise<void> {
  try {
    console.log(`💾 [DOWNLOAD] Downloading document: ${documentId}`);
    const url = await getDocumentAccessUrl(documentId);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ [DOWNLOAD] Download initiated successfully`);
  } catch (error) {
    console.error(`❌ [DOWNLOAD] Download failed:`, error);
    throw error;
  }
}