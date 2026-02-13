import { API_BASE_URL } from "@/config/env";

const API = API_BASE_URL;

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
  return `${API}${normalizedPath}`;
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

export const createLead = async (payload: any) => {
  const res = await fetch("/api/crm/lead", {
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
