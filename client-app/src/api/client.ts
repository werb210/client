import type { AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient, { resolveApiUrl } from "@/lib/apiClient";
import { apiRequest as request } from "./request";
import { runtimeConfig } from "../config/runtimeConfig";

export function getApiBase(): string {
  return runtimeConfig.API_BASE.replace(/\/$/, "");
}

export const API_BASE = getApiBase();

export function buildApiUrl(path: string): string {
  const base = getApiBase();

  if (!path) {
    return base;
  }

  if (path.startsWith("http")) {
    return path;
  }

  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.replace(/^\/api/, "");
  }

  return `${base}${normalizedPath}`;
}

function toAxiosConfig(options: RequestInit = {}): AxiosRequestConfig {
  const method = options.method || "GET";
  const body = options.body;

  let data: unknown = body;
  if (typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  return {
    method,
    headers: options.headers as AxiosRequestConfig["headers"],
    data,
    withCredentials: options.credentials === "include" ? true : undefined,
  };
}

function normalizePath(path: string) {
  return resolveApiUrl(path);
}

export async function clientApi(path: string, options: RequestInit = {}) {
  const response = await apiClient.request({
    url: normalizePath(path),
    ...toAxiosConfig(options),
  });

  return response.data;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await request(path, options);

  if (!response.ok) {
    return {};
  }

  try {
    const text = await response.text();
    if (!text) {
      return {};
    }

    return JSON.parse(text);
  } catch {
    return {};
  }
}

type ApiResponse<T = unknown> = Promise<AxiosResponse<T>>;

const api = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.get<T>(normalizePath(url), config);
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.post<T>(normalizePath(url), data, config);
  },
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.patch<T>(normalizePath(url), data, config);
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.put<T>(normalizePath(url), data, config);
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.delete<T>(normalizePath(url), config);
  },
  request<T = unknown>(config: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.request<T>({
      ...config,
      url: normalizePath(config.url || ""),
    });
  }
};

export default api;
