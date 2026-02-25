import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosProgressEvent,
} from "axios";

export interface ApiRequestOptions extends AxiosRequestConfig {
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  withCredentials: true,
});

export const api = apiClient;

export async function apiGet<T>(
  url: string,
  config?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: ApiRequestOptions
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export default apiClient;
