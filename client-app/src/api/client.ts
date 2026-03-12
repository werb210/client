import type { AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient from "@/lib/apiClient";
import { apiRequest as request, apiUrl, getApiBaseUrl } from "./request";

export function buildApiUrl(path: string): string {
  if (!path) {
    return `${getApiBaseUrl()}/api`;
  }

  if (path.startsWith("http")) {
    return path;
  }

  return apiUrl(path);
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
  return apiUrl(path);
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
  return response.json();
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
