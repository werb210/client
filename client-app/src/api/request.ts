import { resolveApiUrl } from "../lib/apiClient";

function getClientSessionToken() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("client_session");
  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored);
    if (typeof session?.token === "string") {
      return session.token;
    }
  } catch {
    if (typeof stored === "string") {
      return stored;
    }
  }

  return null;
}

export function apiUrl(path: string) {
  return resolveApiUrl(path);
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = apiUrl(path);
  const token = getClientSessionToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    return await fetch(url, {
      credentials: "include",
      headers,
      ...options,
    });
  } catch {
    return new Response("{}", {
      status: 503,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export function getApiBaseUrl() {
  return apiUrl("");
}
