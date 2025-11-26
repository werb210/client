import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASE } from "@/lib/env";

const normalizeBaseUrl = (raw?: string): string => {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "/api";
  const withoutTrailingSlash = trimmed.replace(/\/$/, "");
  return withoutTrailingSlash.endsWith("/api")
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const staffBaseEnv =
  (import.meta as any).env?.VITE_STAFF_API_BASE ||
  (import.meta as any).env?.VITE_API_BASE ||
  API_BASE;

export const STAFF_API_BASE = normalizeBaseUrl(staffBaseEnv);

export const httpClient: AxiosInstance = axios.create({
  baseURL: STAFF_API_BASE,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

httpClient.interceptors.request.use((config) => {
  const nextConfig: AxiosRequestConfig = { ...config };

  nextConfig.headers = {
    Accept: "application/json",
    ...config.headers,
  };

  // Always use relative paths to avoid CORS preflight surprises in production
  if (nextConfig.url && /^https?:\/\//i.test(nextConfig.url)) {
    const external = new URL(nextConfig.url);
    nextConfig.url = external.pathname + external.search + external.hash;
  }

  if (nextConfig.url && !nextConfig.url.startsWith("/")) {
    nextConfig.url = `/${nextConfig.url}`;
  }

  return nextConfig;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response) {
      const { status, statusText } = error.response;
      error.message = `API ${status}: ${statusText}`;
    }
    return Promise.reject(error);
  },
);
