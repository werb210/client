import { API_BASE_URL } from '@/constants';

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
}

export const AuthAPI = {
  login: (body: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body: any) => apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  me: () => apiFetch('/auth/user', { method: 'GET' }),
  logout: () => apiFetch('/auth/logout', { method: 'GET' }),
  requestReset: (body: any) => apiFetch('/auth/request-reset', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: () => apiFetch('/auth/resend-otp', { method: 'POST' }),
};