import axios from "axios";
import { runtimeConfig } from "@/config/runtimeConfig";

export const apiClient = axios.create({
  baseURL: runtimeConfig.API_BASE,
  withCredentials: true
});

export function resolveApiUrl(path: string) {
  if (!path) return runtimeConfig.API_BASE;
  if (/^https?:\/\//.test(path)) return path;

  const base = runtimeConfig.API_BASE.replace(/\/$/, "");
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.replace(/^\/api/, "");
  }

  return `${base}${normalizedPath}`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = resolveApiUrl(path);
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

apiClient.interceptors.response.use(
  r => r,
  err => {
    import("@/utils/apiErrorHandler").then(m => m.handleApiError(err));
    return Promise.reject(err);
  }
);

export default apiClient;
