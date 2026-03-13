import { getRuntimeConfig } from "../config/runtimeConfig";

function getApiOrigin() {
  const { API_BASE_URL } = getRuntimeConfig();
  return API_BASE_URL.replace(/\/$/, "");
}

function normalizeApiPath(path: string, base: string) {
  let normalized = path;

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (base.endsWith("/api") && normalized.startsWith("/api/")) {
    return normalized.replace(/^\/api/, "");
  }

  return normalized;
}

export function apiUrl(path: string) {
  const base = getApiOrigin();
  return `${base}${normalizeApiPath(path, base)}`;
}

export function apiRequest(path: string, options: RequestInit = {}) {
  const url = apiUrl(path);

  return fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
}

export function getApiBaseUrl() {
  return getApiOrigin();
}
