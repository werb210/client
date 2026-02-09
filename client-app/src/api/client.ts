import axios from "axios";
import { handleAuthError } from "../auth/sessionHandler";
import {
  ensureClientSession,
  getActiveClientSessionToken,
  getClientSessionByToken,
  isClientSessionValid,
  markClientSessionExpired,
  markClientSessionRevoked,
} from "../state/clientSession";

export const API_BASE_URL = "https://api.staff.boreal.financial";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
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
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${session.accessToken}`,
  };
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    try {
      return await handleAuthError(err);
    } catch (error) {
      console.error("API ERROR:", error);
      return Promise.reject(error);
    }
  }
);
