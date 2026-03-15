import { apiRequest } from "@/api/client";

export async function safeFetch(url: string, options?: RequestInit) {
  try {
    return await apiRequest(url, options);
  } catch {
    console.warn("API failure:", url);
    return null;
  }
}
