/**
 * Upload Document Utility - S3 Integration via Staff Backend
 * Handles file uploads to staff backend which manages S3 storage
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://staff.boreal.financial/api';

export interface UploadResponse {
  success: boolean;
  documentId: string;
  storage_key: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  message?: string;
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
export async function uploadDocument(
  file: File,
  documentType: string,
  applicationId: string
): Promise<UploadResponse> {
  console.log(`📤 [UPLOAD] Starting upload: ${file.name} (${documentType}) for application ${applicationId}`);
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);  // user-selected file
    formData.append('documentType', documentType); // e.g. 'bank_statements'
    
    console.log(`📋 [UPLOAD] FormData prepared:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentType: documentType,
      endpoint: `${API_BASE_URL}/api/public/upload/${applicationId}`
    });

    // Upload to staff backend
    const response = await fetch(`${API_BASE_URL}/api/public/upload/${applicationId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });

    console.log(`📊 [UPLOAD] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [UPLOAD] Upload failed:`, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ [UPLOAD] Upload successful:`, result);

    // Validate response contains required fields
    if (!result.storage_key) {
      console.warn(`⚠️ [UPLOAD] Warning: No storage_key in response:`, result);
    }

    return {
      success: true,
      documentId: result.documentId || result.id,
      storage_key: result.storage_key || result.storageKey,
      fileName: result.fileName || file.name,
      fileSize: result.fileSize || file.size,
      documentType: result.documentType || documentType,
      message: result.message
    };

  } catch (error) {
    console.error(`❌ [UPLOAD] Upload error:`, error);
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