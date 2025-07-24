import { API_BASE_URL, APP_CONFIG } from '@/constants';
import { logger } from '@/lib/utils';

// Production console management handled by global configuration
// Console output is controlled in main.tsx through productionConsole.ts

// Test function to verify staff backend connectivity
export async function testStaffBackendConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      return { connected: true };
    } else {
      return { connected: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown network error' 
    };
  }
}

// Error class for API-related errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function with enhanced error handling
export const apiFetch = async (path: string, opts: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(`${path}`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`,
        ...(opts.headers || {}) 
      },
      ...opts,
    });
    return response;
  } catch (error) {
    // Handle network/CORS errors that cause empty error objects
    logger.warn('Network request failed:', error);
    throw new ApiError(
      'Network connection failed - staff backend unreachable',
      0,
      undefined
    );
  }
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(endpoint, options);
  
  // Handle authentication errors with user-friendly message
  if (response.status === 401) {
    throw new ApiError('Session expired – retry in 30 s or contact support', 401, response);
  }
  
  // Handle staff backend unavailable
  if (!response.ok && response.status >= 500) {
    logger.warn('Staff backend temporarily unavailable:', response.status);
    throw new ApiError(`Staff backend error: ${response.statusText}`, response.status, response);
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      `API Error: ${response.status} - ${errorText}`,
      response.status,
      response
    );
  }
  
  // Handle empty responses
  if (response.status === 204) {
    return null as T;
  }
  
  try {
    return await response.json();
  } catch (jsonError) {
    console.warn('JSON parsing failed:', jsonError);
    throw new ApiError('Invalid response format', response.status, response);
  }
}

// Application-related API functions
export interface ApplicationPayload {
  businessInfo: {
    legalName: string;
    industry: string;
    headquarters: string;
    revenue: string;
    useOfFunds: string;
    loanAmount: number;
  };
  personalDetails: {
    name: string;
    email: string;
    phone: string;
  };
  productQuestions: Record<string, any>;
  selectedProduct: string;
  signature: {
    termsAccepted: boolean;
    signed: boolean;
  };
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: string;
  acceptedFormats: string[];
  maxSizeMB: number;
}

export interface Application {
  id: string;
  status: string;
  businessName: string;
  loanAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Submit complete application to staff backend
export async function submitApplication(data: ApplicationPayload): Promise<{ applicationId: string }> {
  return apiRequest<{ applicationId: string }>('/applications/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Upload document file to staff backend (authenticated)
export async function uploadDocument(
  file: File, 
  documentType: string, 
  applicationId: string
): Promise<{ documentId: string; storage_key: string; fileName: string }> {
  const formData = new FormData();
  formData.append('file', file);  // user-selected file
  formData.append('documentType', documentType); // e.g. 'bank_statements'
  
  console.log(`📤 [API] Uploading to staff backend: ${file.name} (${documentType})`);

  const response = await fetch(`/api/public/upload/${applicationId}`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [API] Upload failed:`, errorText);
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ [API] Upload response:`, result);
  
  return {
    documentId: result.documentId || result.id,
    storage_key: result.storage_key || result.storageKey,
    fileName: result.fileName || file.name
  };
}

// Upload document to public endpoint (NO Authorization required - Step 5 specific)
export async function uploadDocumentPublic(
  applicationId: string,
  file: File,
  documentType: string
): Promise<{ documentId: string; url: string }> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  // ✅ Update endpoint to match staff backend: /api/public/documents/${applicationId}
  const endpoint = `/api/public/applications/${applicationId}/documents`;
  // console.log('📤 [UPLOAD] ApplicationId:', applicationId);
  // console.log('📤 [UPLOAD] DocumentType:', documentType);
  // console.log('📤 [UPLOAD] Endpoint:', endpoint);

  // Use direct fetch without Authorization headers
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    // ⚠️ No headers like Authorization!
  });

  // console.log('📤 [UPLOAD] Network response status:', response.status, response.ok ? 'OK' : 'ERROR');

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('📤 [UPLOAD] Upload failed:', response.status, errorText);
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  // console.log('📤 [UPLOAD] Success response:', result);
  
  return result;
}

// Fetch required documents for a specific category/product
export async function fetchRequiredDocuments(category: string): Promise<DocumentRequirement[]> {
  return apiRequest<DocumentRequirement[]>(`/documents/requirements?category=${encodeURIComponent(category)}`);
}

// Get all user applications
export async function getUserApplications(): Promise<Application[]> {
  return apiRequest<Application[]>('/applications');
}

// Get specific application details
export async function getApplication(applicationId: string): Promise<Application> {
  return apiRequest<Application>(`/applications/${applicationId}`);
}





// Fetch lender product requirements
export async function getLenderProducts(category?: string): Promise<any[]> {
  const endpoint = category 
    ? `/lenders/requirements?category=${encodeURIComponent(category)}`
    : '/lenders/requirements';
  return apiRequest<any[]>(endpoint);
}

// User profile and registration
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  is2FAEnabled: boolean;
}

export async function getUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/user');
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/user', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// 2FA functions
export async function send2FACode(phoneNumber: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/auth/2fa/send', {
    method: 'POST',
    body: JSON.stringify({ phone: phoneNumber }),
  });
}

export async function verify2FACode(phoneNumber: string, code: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ phone: phoneNumber, code }),
  });
}

export async function get2FAStatus(): Promise<{
  is2FAEnabled: boolean;
  phoneNumber?: string;
  twoFactorComplete: boolean;
}> {
  return apiRequest<{
    is2FAEnabled: boolean;
    phoneNumber?: string;
    twoFactorComplete: boolean;
  }>('/auth/2fa/status');
}

// Applications API for Draft-Before-Sign Flow
export const Applications = {
  /* Create draft and get signUrl */
  createDraft: (formData: Record<string, any>) =>
    apiFetch('/api/public/applications', {
      method: 'POST',
      body: JSON.stringify({ formData }),
    }),

  /* Complete application after docs */
  complete: (id: string, payload: any) =>
    apiFetch(`/api/public/applications/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};