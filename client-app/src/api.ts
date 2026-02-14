import { apiRequest } from "./lib/api";

const api = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      method: "GET",
    });

    return { data: data as T };
  },
  post: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });

    return { data: data as T };
  },
  patch: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(body ?? {}),
    });

    return { data: data as T };
  },
};

export default api;
