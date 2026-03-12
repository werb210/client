import type { AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient from "@/lib/apiClient";
import { ENV } from "../config/env";

const API_BASE_URL = ENV.API_URL;

export function buildApiUrl(path: string): string {
  if (!path) return API_BASE_URL;

  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

export { API_BASE_URL };

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
  return buildApiUrl(path);
}

export async function clientApi(path: string, options: RequestInit = {}) {
  const response = await apiClient.request({
    url: normalizePath(path),
    ...toAxiosConfig(options),
  });

  return response.data;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await apiClient.request({
    url: normalizePath(path),
    ...toAxiosConfig(options),
  });

  return response.data;
}

type ApiResponse<T = unknown> = Promise<AxiosResponse<T>>;

const api = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.get<T>(url, config);
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.post<T>(url, data, config);
  },
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.patch<T>(url, data, config);
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.put<T>(url, data, config);
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.delete<T>(url, config);
  },
  request<T = unknown>(config: AxiosRequestConfig): ApiResponse<T> {
    return apiClient.request<T>(config);
  }
};

export default api;
