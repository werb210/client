// Fallback API client for when staff backend is unreachable
// Provides graceful degradation and detailed error reporting

interface FallbackResponse {
  success: boolean;
  data?: any;
  error?: string;
  fallback?: boolean;
  connectivity?: {
    staffBackend: boolean;
    lastTested: string;
    errorDetails?: any;
  };
}

class FallbackApiClient {
  private staffBackendUrl = 'https://staffportal.replit.app/api';
  private lastConnectivityCheck: { success: boolean; timestamp: number } | null = null;
  private connectivityCacheMs = 30000; // 30 seconds

  async testConnectivity(): Promise<boolean> {
    // Use cached result if recent
    if (this.lastConnectivityCheck && 
        Date.now() - this.lastConnectivityCheck.timestamp < this.connectivityCacheMs) {
      return this.lastConnectivityCheck.success;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.staffBackendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });

      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      this.lastConnectivityCheck = {
        success: isConnected,
        timestamp: Date.now()
      };

      return isConnected;
    } catch (error) {
      console.error('Staff backend connectivity test failed:', {
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });

      this.lastConnectivityCheck = {
        success: false,
        timestamp: Date.now()
      };

      return false;
    }
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<FallbackResponse> {
    const url = `${this.staffBackendUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        return {
          success: false,
          error: 'Staff backend returned HTML instead of JSON - CORS configuration issue',
          connectivity: {
            staffBackend: false,
            lastTested: new Date().toISOString(),
            errorDetails: { contentType, preview: text.substring(0, 200) }
          }
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        connectivity: {
          staffBackend: true,
          lastTested: new Date().toISOString()
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Test basic connectivity
      const isConnected = await this.testConnectivity();
      
      return {
        success: false,
        error: errorMessage,
        connectivity: {
          staffBackend: isConnected,
          lastTested: new Date().toISOString(),
          errorDetails: {
            type: error instanceof Error ? error.name : 'Unknown',
            message: errorMessage,
            url,
            method: options.method || 'GET'
          }
        }
      };
    }
  }

  // Authentication methods with fallback
  async register(email: string, password: string, phone: string): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, phone })
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend for registration. Please check your internet connection and try again.',
        fallback: true
      };
    }

    return result;
  }

  async verifyOtp(email: string, code: string): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend for OTP verification. Please check your connection.',
        fallback: true
      };
    }

    return result;
  }

  async requestPasswordReset(email: string): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend for password reset. Please try again later.',
        fallback: true
      };
    }

    return result;
  }

  async resetPassword(token: string, newPassword: string): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend for password reset. Please try again later.',
        fallback: true
      };
    }

    return result;
  }

  async login(email: string, password: string): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend for login. Please check your connection.',
        fallback: true
      };
    }

    return result;
  }

  async getCurrentUser(): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/user');

    if (!result.success && !result.connectivity?.staffBackend) {
      return {
        ...result,
        error: 'Cannot reach staff backend to get user information.',
        fallback: true
      };
    }

    return result;
  }

  async logout(): Promise<FallbackResponse> {
    const result = await this.makeRequest('/auth/logout', {
      method: 'POST'
    });

    if (!result.success && !result.connectivity?.staffBackend) {
      // Logout can succeed locally even if backend is unreachable
      return {
        success: true,
        data: { message: 'Logged out locally (staff backend unreachable)' },
        fallback: true,
        connectivity: {
          staffBackend: false,
          lastTested: new Date().toISOString()
        }
      };
    }

    return result;
  }

  async healthCheck(): Promise<FallbackResponse> {
    return this.makeRequest('/health');
  }
}

export const fallbackApi = new FallbackApiClient();