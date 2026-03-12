import { getRuntimeConfig } from "../config/runtimeConfig";

function getApiOrigin() {
  const { API_BASE_URL } = getRuntimeConfig();
  return API_BASE_URL.replace(/\/$/, "");
}

function normalizeApiPath(path: string) {
  let normalized = path;

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return normalized;
}

export function apiUrl(path: string) {
  return `${getApiOrigin()}${normalizeApiPath(path)}`;
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
