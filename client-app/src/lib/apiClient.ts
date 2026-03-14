import axios from "axios";
import { API_TIMEOUT } from "../config/api";
import { getRuntimeConfig } from "../config/runtimeConfig";

export const API_BASE = import.meta.env.VITE_API_BASE || "";

function getConfiguredBase() {
  if (API_BASE) {
    return API_BASE.replace(/\/$/, "");
  }

  const { API_URL } = getRuntimeConfig();
  return API_URL.replace(/\/$/, "");
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
  const res = await fetch(resolveApiUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
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
