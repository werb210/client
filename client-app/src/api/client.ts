import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

function normalizeBase(url?: string) {
  if (!url) return "";
  return url.replace(/\/api\/?$/, "");
}

const base =
  normalizeBase(import.meta.env.VITE_API_URL) ||
  normalizeBase(window.RUNTIME_CONFIG?.API_BASE_URL) ||
  "";

export const apiClient = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
});

function normalizePath(url: string): string {
  if (!url) return "/";
  if (/^https?:\/\//.test(url)) return url;
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return normalized.replace(/^\/api(?=\/|$)/, "") || "/";
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
    data,
    headers: options.headers as AxiosRequestConfig["headers"],
    withCredentials: options.credentials === "include" ? true : undefined,
  };
}

export function buildApiUrl(path: string): string {
  const pathPart = normalizePath(path);

  if (/^https?:\/\//.test(pathPart)) {
    return pathPart;
  }

  const root = `${base}/api`.replace(/\/$/, "");
  return `${root}${pathPart}`;
}

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: normalizePath(path),
      ...toAxiosConfig(options),
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<T>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }
    return {} as T;
  }
}

export const get = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  apiClient.get<T>(normalizePath(url), config);
export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.post<T>(normalizePath(url), data, config);
export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.put<T>(normalizePath(url), data, config);
export const patch = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiClient.patch<T>(normalizePath(url), data, config);
export const del = <T = unknown>(url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<T>(normalizePath(url), config);

const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  request: <T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.request<T>({ ...config, url: normalizePath(config.url || "") }),
};

export default api;
