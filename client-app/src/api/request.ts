import { resolveApiUrl } from "../lib/apiClient";

export function apiUrl(path: string) {
  return resolveApiUrl(path);
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = apiUrl(path);

  try {
    return await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
  } catch {
    return new Response("{}", {
      status: 503,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}

export function getApiBaseUrl() {
  return apiUrl("");
}
