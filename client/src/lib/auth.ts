import { apiFetch } from './api';

export const Auth = {
  register: async (email: string, password: string, phone: string) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, phone })
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST'
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  verifyOtp: async (email: string, code: string) => {
    try {
      const response = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  requestReset: (phone: string) =>
    apiFetch('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
};