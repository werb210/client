// Dedicated Staff Backend API Client
// This handles all communication with the staff backend API

const STAFF_API_BASE = 'https://staffportal.replit.app/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class StaffApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Non-JSON response received:', {
          url,
          status: response.status,
          contentType,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // If we get HTML, it means CORS/routing issue
        if (contentType?.includes('text/html')) {
          return {
            success: false,
            error: 'CORS or routing configuration issue - received HTML instead of JSON'
          };
        }
        
        return {
          success: false,
          error: `Unexpected content type: ${contentType}`
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
          data
        };
      }

      return {
        success: true,
        data,
        message: data.message
      };
    } catch (error) {
      console.error('Staff API request failed:', {
        url,
        endpoint,
        error: error instanceof Error ? error.message : error,
        options: {
          method: options.method || 'GET',
          credentials: 'include',
          mode: 'cors'
        },
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Registration with SMS OTP
  async register(email: string, password: string, phone: string): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone })
    });
  }

  // Verify OTP code
  async verifyOtp(email: string, code: string): Promise<ApiResponse> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
  }

  // Login with email/password
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/auth/user');
  }

  // Logout user
  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return this.request('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Test connectivity
  async testConnection(): Promise<{
    healthCheck: ApiResponse;
    registrationTest: ApiResponse;
    corsTest: boolean;
  }> {
    const healthCheck = await this.healthCheck();
    
    const registrationTest = await this.register(
      'test@example.com',
      'testpass123',
      '+15878881837'
    );

    // Test CORS by checking if we can make a simple request
    let corsTest = false;
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      corsTest = response.ok && response.headers.get('content-type')?.includes('json') || false;
    } catch {
      corsTest = false;
    }

    return {
      healthCheck,
      registrationTest,
      corsTest
    };
  }
}

export const staffApi = new StaffApiClient(STAFF_API_BASE);
export default staffApi;