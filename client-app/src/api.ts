import { apiRequest } from "./lib/api";

const api = {
  post: async <T>(url: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest(url, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    });

    return { data: data as T };
  },
};

export default api;
