import { apiFetch } from '@/lib/api';

// Enhanced AuthAPI with proper error handling
export const AuthAPI = {
  // Login - triggers SMS OTP with CORS error handling
  login: async (body: { email: string; password: string }) => {
    try {
      return await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    } catch (error) {
      // Handle CORS/network errors by returning a mock response structure
      console.warn('Authentication API unavailable - CORS issue detected');
      return new Response(
        JSON.stringify({ 
          error: 'Staff backend connection required', 
          cors: true 
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