import { apiFetch } from '@/lib/api';

export const AuthAPI = {
  // Login - triggers SMS OTP
  login: (body: { email: string; password: string }) => 
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  
  // Register - creates account and sends SMS OTP
  register: (body: { email: string; phone: string; password: string }) => 
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  
  // Verify OTP - completes authentication
  verifyOtp: (body: { email: string; code: string }) => 
    apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  
  // Resend OTP
  resendOtp: (body: { email: string }) => 
    apiFetch('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  
  // Get current authenticated user
  getCurrentUser: () => apiFetch('/auth/current-user', { method: 'GET' }),
  
  // Logout
  logout: () => apiFetch('/auth/logout', { method: 'GET' }),
  
  // Password reset (future implementation)
  requestReset: (body: any) => apiFetch('/auth/request-reset', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};