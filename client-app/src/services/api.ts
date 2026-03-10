import { logClientError } from "@/lib/logger";

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("unauthorized");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error((data as { error?: string })?.error || "api_error");
    logClientError(error);
    throw error;
  }

  return data as T;
}
