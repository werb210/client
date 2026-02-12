import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { handleAuthError } from "../auth/sessionHandler";
import {
  ensureClientSession,
  getActiveClientSessionToken,
  getClientSessionByToken,
  isClientSessionValid,
  markClientSessionExpired,
  markClientSessionRevoked,
} from "../state/clientSession";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

api.interceptors.request.use((config) => {
  const activeToken = getActiveClientSessionToken();
  if (!activeToken) return config;
  const session =
    getClientSessionByToken(activeToken) ||
    ensureClientSession({ submissionId: activeToken, accessToken: activeToken });
  if (!isClientSessionValid(session)) {
    if (session.revokedAt) {
      markClientSessionRevoked(activeToken, session.revokedAt);
    } else {
      markClientSessionExpired(activeToken);
    }
    return Promise.reject(new Error("Client session is no longer valid."));
  }
  if (session.accessToken) {
    (config.headers as any).Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    try {
      return await handleAuthError(err);
    } catch (error: any) {
      const status = error?.response?.status;

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return Promise.reject(new Error("You're offline. Please reconnect."));
      }

      if (status === 401 && typeof window !== "undefined") {
        window.location.assign("/apply/step-1");
      }

      if (status >= 500) {
        return Promise.reject(new Error("Server error. Please try again shortly."));
      }

      return Promise.reject(error);
    }
  }
);
