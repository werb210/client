import { apiRequest } from "./lib/api";

const api = {
  get: async <T>(url: string, options: RequestInit = {}): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      ...options,
      method: "GET",
    });

    return { data: data as T };
  },
  post: async <T>(url: string, body?: unknown, options: RequestInit = {}): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });

    return { data: data as T };
  },
  patch: async <T>(url: string, body?: unknown, options: RequestInit = {}): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });

    return { data: data as T };
  },
};

export default api;
