/**
 * Application Service - Handles submission and document uploads to Staff API
 */

const STAFF_API_URL = ""; // Same-origin only

export interface ApplicationPayload {
  step1?: {
    requestedAmount: number;
    fundingAmount: number;
    use_of_funds: string;
    businessLocation: string;      // 2-letter country code
    industry: string;
  };
  step3?: {
    businessName: string;
    operatingName: string;
    legalName: string;
    businessType: string;
    industry: string;
    businessPhone: string;
  };
  step4?: {
    firstName: string;
    lastName: string;
    email: string;
    applicantEmail: string;
    phone: string;
    applicantPhone: string;
  };
  metadata?: {
    source?: string;
    testSubmission?: boolean;
    requestedAmount?: number;
  };
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
    console.log('🔗 [APPLICATION_SERVICE] API URL:', `${STAFF_API_URL}/public/applications`);
    console.log('📋 [APPLICATION_SERVICE] Payload structure:', {
      step1: data.step1 ? Object.keys(data.step1) : [],
      step3: data.step3 ? Object.keys(data.step3) : [],
      step4: data.step4 ? Object.keys(data.step4) : [],
      metadata: data.metadata ? Object.keys(data.metadata) : []
    });

    // Validate all required fields as specified by staff backend
    const missingFields = [];
    
    // Check step1 required fields
    if (!data.step1?.requestedAmount) missingFields.push('amountRequested');
    if (!data.step1?.businessLocation) missingFields.push('businessLocation');
    
    // Check step3 required fields
    if (!data.step3?.businessName) missingFields.push('businessName');
    if (!data.step3?.businessType) missingFields.push('businessType');
    
    // Check step4 required fields
    if (!data.step4?.firstName) missingFields.push('firstName');
    if (!data.step4?.lastName) missingFields.push('lastName');
    if (!data.step4?.email) missingFields.push('email');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Get CSRF token from cookie
    const getCsrfToken = () => {
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('__Host-bf_csrf='));
      return csrfCookie ? csrfCookie.split('=')[1] : null;
    };

    const csrfToken = getCsrfToken();
    console.log('🔒 [APPLICATION_SERVICE] CSRF token:', csrfToken ? 'found' : 'missing');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(`${STAFF_API_URL}/public/applications`, {
      method: 'POST',
      headers,
      credentials: 'same-origin', // Include cookies
      body: JSON.stringify(data),
    });

    console.log('📊 [APPLICATION_SERVICE] Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorText = await response.text();
      }
      
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

    const response = await fetch(`${STAFF_API_URL}/public/applications/${applicationId}/submit`, {
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
    console.log('🔗 [DOCUMENT_SERVICE] API URL:', `${STAFF_API_URL}/public/applications/${applicationId}/documents`);
    
    // Create FormData with proper field names
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', category);
    
    console.log('📋 [DOCUMENT_SERVICE] FormData prepared:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      category,
      applicationId
    });

    const response = await fetch(`${STAFF_API_URL}/public/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      }
    });

    console.log('📊 [DOCUMENT_SERVICE] Response status:', response.status, response.statusText);

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorText = await response.text();
      }
      
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