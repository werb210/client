import axios, { AxiosRequestConfig } from "axios";

export interface ApiRequestOptions extends AxiosRequestConfig {
  onUploadProgress?: (event: ProgressEvent) => void;
}

export const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || "",
  withCredentials: true,
});

export const api = apiClient;

export async function apiGet<T = any>(url: string, config?: ApiRequestOptions): Promise<T> {
  const res = await apiClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: ApiRequestOptions
): Promise<T> {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
}

export default apiClient;
