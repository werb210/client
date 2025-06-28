import { apiFetch } from './api';

export const Auth = {
  requestReset: (email: string) =>
    apiFetch("/auth/request-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};