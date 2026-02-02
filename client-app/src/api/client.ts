import axios from "axios";
import { handleAuthError } from "../auth/sessionHandler";

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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    try {
      return await handleAuthError(err, (config) => api(config));
    } catch (error) {
      console.error("API ERROR:", error);
      return Promise.reject(error);
    }
  }
);
