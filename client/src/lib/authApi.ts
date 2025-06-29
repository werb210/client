import { apiFetch } from '@/lib/api';

// Enhanced AuthAPI with proper error handling
export const AuthAPI = {
  // Login - enhanced diagnostics for staff backend
  login: async (body: { email: string; password: string }) => {
    try {
      console.log('Attempting login to:', `${import.meta.env.VITE_API_BASE_URL}/auth/login`);
      
      const response = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) });
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlContent = await response.text();
        console.warn('HTML Response received:', htmlContent.substring(0, 200));
        
        return new Response(
          JSON.stringify({ 
            error: 'Staff backend endpoint returning HTML page instead of JSON API response',
            details: 'Check if /auth/login endpoint exists and is configured for JSON responses',
            success: false
          }), 
          { status: 502, statusText: 'Bad Gateway' }
        );
      }
      
      return response;
    } catch (error) {
      console.error('Authentication request failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Unable to connect to staff backend authentication service',
          details: 'Network error or CORS configuration issue',
          success: false
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Register - creates account and sends SMS OTP
  register: async (body: { email: string; phone: string; password: string }) => {
    try {
      return await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    } catch (error) {
      console.warn('Registration API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required for registration', 
          cors: true 
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Verify OTP - completes authentication
  verifyOtp: async (body: { email: string; code: string }) => {
    try {
      return await apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
    } catch (error) {
      console.warn('OTP verification API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required for OTP verification', 
          cors: true 
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Resend OTP
  resendOtp: async (body: { email: string }) => {
    try {
      return await apiFetch('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) });
    } catch (error) {
      console.warn('Resend OTP API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required for OTP resend', 
          cors: true 
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Get current authenticated user
  getCurrentUser: async () => {
    try {
      return await apiFetch('/auth/current-user', { method: 'GET' });
    } catch (error) {
      console.warn('User API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required', 
          cors: true 
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Logout
  logout: async () => {
    try {
      return await apiFetch('/auth/logout', { method: 'GET' });
    } catch (error) {
      console.warn('Logout API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required for logout', 
          cors: true 
        }), 
        { status: 503, statusText: 'Service Unavailable' }
      );
    }
  },
  
  // Password reset
  requestReset: (email: string) =>
    apiFetch('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (t: string, pw: string) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: t, password: pw }),
    }),
};