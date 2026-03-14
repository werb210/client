import { resolveApiUrl } from "../lib/apiClient";

export function apiUrl(path: string) {
  return resolveApiUrl(path);
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
  return apiUrl("");
}
