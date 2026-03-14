import axios from "axios";
import { API_TIMEOUT } from "../config/api";

export const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.RUNTIME_CONFIG?.API_BASE_URL ||
  "/api";

function getConfiguredBase() {
  return API_BASE.replace(/\/$/, "");
}

export function resolveApiUrl(path: string) {
  if (!path) return getConfiguredBase();
  if (/^https?:\/\//.test(path)) return path;

  const base = getConfiguredBase();
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.replace(/^\/api/, "");
  }

  return `${base}${normalizedPath}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = resolveApiUrl(path);
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const apiClient = axios.create({
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getConfiguredBase();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
