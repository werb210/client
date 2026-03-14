import axios from "axios";
import { API_TIMEOUT } from "../config/api";
import { getRuntimeConfig } from "../config/runtimeConfig";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

function getConfiguredBase() {
  const { API_URL } = getRuntimeConfig();
  return (API_URL || API_BASE).replace(/\/$/, "");
}

export function resolveApiUrl(path: string) {
  if (!path) {
    return getConfiguredBase();
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const base = getConfiguredBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.replace(/^\/api/, "")}`;
  }

  return `${base}${normalizedPath}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
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
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getConfiguredBase();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Client API error:", error?.response || error);
    return Promise.reject(error);
  }
);

export default apiClient;
