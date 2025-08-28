/**
 * Application Service - Handles submission and document uploads to Staff API
 */

const STAFF_API_URL = ""; // Same-origin only

export interface ApplicationPayload {
  requested_amount: number;        // Required - integer amount
  product_id: string;             // Required - selected product ID  
  country: 'CA' | 'US';          // Required - enum from DB
  step1?: any;                    // Optional - additional step1 data
  step3?: any;                    // Optional - business details
  step4?: any;                    // Optional - applicant info
  uploadedDocuments?: Array<{     // Optional - uploaded docs
    id: string;
    name: string;
    documentType: string;
    size: number;
    type: string;
  }>;
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
 * Create new application with required backend fields
 */
export async function createApplication(data: ApplicationPayload): Promise<ApplicationResponse> {
  try {
    console.log('📤 [APPLICATION_SERVICE] Creating application...');
    console.log('🔗 [APPLICATION_SERVICE] API URL:', `${STAFF_API_URL}/api/applications`);
    console.log('📋 [APPLICATION_SERVICE] Payload structure:', {
      requested_amount: data.requested_amount,
      product_id: data.product_id,
      country: data.country,
      step1Fields: Object.keys(data.step1 || {}).length,
      step3Fields: Object.keys(data.step3 || {}).length,
      step4Fields: Object.keys(data.step4 || {}).length,
      documentsCount: data.uploadedDocuments?.length || 0
    });

    // Validate required fields before sending
    if (!data.requested_amount || !data.product_id || !data.country) {
      throw new Error('Missing required fields: requested_amount, product_id, country');
    }

    const response = await fetch(`${STAFF_API_URL}/api/applications`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || ''}`
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
      applicationId: result.applicationId || result.id,
      status: 'submitted',
      message: result.message
    };

  } catch (error) {
    console.error('❌ [APPLICATION_SERVICE] Creation error:', error);
    
    // Return structured error response
    return {
      applicationId: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown creation error'
    };
  }
}

/**
 * Submit completed application (legacy function - kept for compatibility)
 */
export async function submitApplication(data: ApplicationPayload): Promise<ApplicationResponse> {
  return createApplication(data);
}

/**
 * Submit final application for processing
 */
export async function submitFinalApplication(applicationId: string): Promise<ApplicationResponse> {
  try {
    console.log('📤 [APPLICATION_SERVICE] Submitting final application:', applicationId);

    const response = await fetch(`${STAFF_API_URL}/api/applications/${applicationId}/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || ''}`
      },
    });

    console.log('📊 [APPLICATION_SERVICE] Final submit response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [APPLICATION_SERVICE] Final submission failed:', {
        status: response.status,
        errorText
      });
      
      throw new Error(`Final submission failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [APPLICATION_SERVICE] Final application submitted successfully:', result);
    
    return {
      applicationId: applicationId,
      status: 'submitted',
      message: result.message || 'Application submitted successfully'
    };

  } catch (error) {
    console.error('❌ [APPLICATION_SERVICE] Final submission error:', error);
    
    return {
      applicationId: applicationId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown final submission error'
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