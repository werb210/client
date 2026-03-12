const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://server.boreal.financial";

function normalizeApiPath(path: string) {
  let normalized = path;

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (!normalized.startsWith("/api")) {
    normalized = `/api${normalized}`;
  }

  return normalized;
}

export function apiUrl(path: string) {
  return `${API_BASE_URL}${normalizeApiPath(path)}`;
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

export { API_BASE_URL };
