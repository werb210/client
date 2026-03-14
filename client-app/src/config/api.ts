export { apiUrl, getApiBaseUrl } from "../api/request";

export const API_TIMEOUT = 30000;

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.RUNTIME_CONFIG?.API_BASE_URL ||
  "/api";
