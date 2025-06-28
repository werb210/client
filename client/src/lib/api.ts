// Production configuration for deployment
const PRODUCTION_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://staff.borealfinance.app/api',
  SIGNNOW_REDIRECT_URL: import.meta.env.VITE_SIGNNOW_REDIRECT_URL || window.location.origin + '/step6-signature',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MIN_FILE_SIZE: 5 * 1024, // 5KB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  IS_PRODUCTION: import.meta.env.PROD,
  SECURE_COOKIES: import.meta.env.PROD, // Enable secure cookies in production
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

// Disable debug logs in production
if (PRODUCTION_CONFIG.IS_PRODUCTION) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Centralized API communication layer for staff backend integration
const API_BASE_URL = PRODUCTION_CONFIG.API_BASE_URL;

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
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    credentials: 'include', // Include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Redirect to login while preserving current form data
      window.location.href = '/api/login';
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
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
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