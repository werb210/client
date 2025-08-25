/**
 * Application Service - Handles submission and document uploads to Staff API
 */

const STAFF_API_URL = ""; // Same-origin only

export interface ApplicationPayload {
  step1: any;
  step3: any;
  step4: any;
  uploadedDocuments: Array<{
    id: string;
    name: string;
    documentType: string;
    size: number;
    type: string;
  }>;
  productId: string;
}

export interface ApplicationResponse {
  applicationId: string;
  status: 'submitted' | 'error';
  message?: string;
  error?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  documentId: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  message?: string;
}

/**
 * Submit application data to Staff API
 */
export async function submitApplication(data: ApplicationPayload): Promise<ApplicationResponse> {
  try {
    console.log('📤 [APPLICATION_SERVICE] Submitting application to staff API...');
    console.log('🔗 [APPLICATION_SERVICE] API URL:', `${STAFF_API_URL}/api/applications`);
    console.log('📋 [APPLICATION_SERVICE] Payload structure:', {
      step1Fields: Object.keys(data.step1 || {}).length,
      step3Fields: Object.keys(data.step3 || {}).length,
      step4Fields: Object.keys(data.step4 || {}).length,
      documentsCount: data.uploadedDocuments?.length || 0,
      productId: data.productId
    });

    const response = await fetch(`${STAFF_API_URL}/api/applications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(data),
    });

    console.log('📊 [APPLICATION_SERVICE] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [APPLICATION_SERVICE] Submission failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: response.url
      });
      
      throw new Error(`Application submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [APPLICATION_SERVICE] Application submitted successfully:', result);
    
    return {
      applicationId: result.applicationId,
      status: 'submitted',
      message: result.message
    };

  } catch (error) {
    console.error('❌ [APPLICATION_SERVICE] Submission error:', error);
    
    // Return structured error response
    return {
      applicationId: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown submission error'
    };
  }
}

/**
 * Upload document to Staff API with FormData
 */
export async function uploadDocument(
  applicationId: string, 
  file: File, 
  category: string
): Promise<DocumentUploadResponse> {
  try {
    console.log(`📤 [DOCUMENT_SERVICE] Uploading document: ${file.name} (${category})`);
    console.log('🔗 [DOCUMENT_SERVICE] API URL:', `${STAFF_API_URL}/api/applications/${applicationId}/documents`);
    
    // Create FormData with proper field names
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    console.log('📋 [DOCUMENT_SERVICE] FormData prepared:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category,
      applicationId
    });

    const response = await fetch(`${STAFF_API_URL}/api/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });

    console.log('📊 [DOCUMENT_SERVICE] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DOCUMENT_SERVICE] Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        fileName: file.name,
        category,
        applicationId
      });
      
      throw new Error(`Document upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [DOCUMENT_SERVICE] Document uploaded successfully:', result);
    
    return {
      success: true,
      documentId: result.documentId || result.id,
      fileName: result.fileName || file.name,
      fileSize: result.fileSize || file.size,
      documentType: result.documentType || category,
      message: result.message
    };

  } catch (error) {
    console.error('❌ [DOCUMENT_SERVICE] Upload error:', error);
    
    // Return structured error response
    throw new Error(error instanceof Error ? error.message : 'Unknown upload error');
  }
}

/**
 * Retry failed operations with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await operation();
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`⚠️ [RETRY] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        console.error('❌ [RETRY] All retry attempts exhausted');
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}