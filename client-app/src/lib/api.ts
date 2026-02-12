import { ENV } from "@/config/env";

export function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${ENV.API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(buildApiUrl(url), {
    credentials: "include",
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Invalid JSON response");
  }
}
