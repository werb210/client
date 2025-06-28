import { API_BASE_URL, APP_CONFIG } from '@/constants';

// Disable debug logs in production
if (APP_CONFIG.IS_PRODUCTION) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

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

// Generic API request function with error handling and auth
export const apiFetch = (path: string, opts: RequestInit = {}) =>
  fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    credentials: "include",
    mode: "cors",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(endpoint, options);
  
  // Handle authentication errors
  if (response.status === 401) {
    window.location.href = '/login';
    throw new ApiError('Unauthorized - redirecting to login', 401, response);
  }
  
  // Handle staff backend unavailable
  if (!response.ok && response.status >= 500) {
    console.warn('Staff backend temporarily unavailable:', response.status);
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
  
  return await response.json();
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

// Upload document file to staff backend
export async function uploadDocument(
  file: File, 
  category: string, 
  applicationId?: string
): Promise<{ documentId: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (applicationId) {
    formData.append('applicationId', applicationId);
  }

  return apiRequest<{ documentId: string; url: string }>('/documents/upload', {
    method: 'POST',
    headers: {}, // Remove Content-Type to let browser set multipart boundary
    body: formData,
  });
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

// Generate SignNow URL for e-signature
export async function getSignNowUrl(applicationId: string): Promise<{ url: string }> {
  return apiRequest<{ url: string }>(`/sign/${applicationId}`, {
    method: 'POST',
  });
}

// Check signature status
export async function checkSignatureStatus(applicationId: string): Promise<{
  signed: boolean;
  signedAt?: string;
  documentUrl?: string;
}> {
  return apiRequest(`/signatures/status/${applicationId}`);
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