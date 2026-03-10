import { logClientError } from "./logger";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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
  return `${baseURL}${normalizedPath}`;
}


async function parseError(response: Response) {
  try {
    const data = await response.json()
    return data?.error || data?.message || `API error ${response.status}`
  } catch {
    return `API error ${response.status}`
  }
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

export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ApiError("You're offline. Please reconnect.", undefined, true);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await globalThis.fetch(buildApiUrl(url), {
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
      const message = await parseError(response);
      throw new ApiError(message, response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError("Invalid JSON response");
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      logClientError(error);
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out.");
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ApiError("You're offline. Please reconnect.", undefined, true);
    }

    logClientError(error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

type ApiRequestOptions = RequestInit & {
  onUploadProgress?: (event: ProgressEvent) => void;
};

const api = {
  get: async <T = any>(url: string, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const requestOptions = options;
    const data = await apiRequest<T>(url, {
      ...requestOptions,
      method: "GET",
    });
    return { data };
  },
  post: async <T = any>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const requestOptions = options;
    const data = await apiRequest<T>(url, {
      ...requestOptions,
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });
    return { data };
  },
  patch: async <T = any>(url: string, body?: unknown, options: ApiRequestOptions = {}): Promise<{ data: T }> => {
    const requestOptions = options;
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
