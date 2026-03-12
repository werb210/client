import { API_BASE } from "./client";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    console.warn("Unauthorized request");
    return null;
  }

  return response.json();
}
