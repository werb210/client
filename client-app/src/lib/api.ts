const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public offline = false
  ) {
    super(message);
  }
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

function handleStatus(status: number) {
  if (status === 401) {
    if (typeof window !== "undefined") {
      window.location.assign("/apply/step-1");
    }
    throw new ApiError("Unauthorized. Please restart at step 1.", 401);
  }

  if (status >= 500) {
    throw new ApiError("Server error. Please try again shortly.", status);
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError("You're offline. Please reconnect.", undefined, true);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(buildApiUrl(url), {
      credentials: "include",
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      handleStatus(response.status);
      throw new ApiError(`API error ${response.status}`, response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError("Invalid JSON response");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out.");
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ApiError("You're offline. Please reconnect.", undefined, true);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

type ApiRequestOptions = RequestInit & { timeout?: number };

const api = {
  get: async <T>(url: string, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const { timeout: _timeout, ...requestOptions } = options;
    const data = await apiRequest<T>(url, {
      ...requestOptions,
      method: "GET",
    });
    return { data };
  },
  post: async <T>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const { timeout: _timeout, ...requestOptions } = options;
    const data = await apiRequest<T>(url, {
      ...requestOptions,
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
    return { data };
  },
  patch: async <T>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const { timeout: _timeout, ...requestOptions } = options;
    const data = await apiRequest<T>(url, {
      ...requestOptions,
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });
    return { data };
  },
};

export default api;

export const createLead = async (payload: unknown) => {
  const res = await fetch(buildApiUrl("/api/crm/lead"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to submit lead");
  }

  return res.json();
};
