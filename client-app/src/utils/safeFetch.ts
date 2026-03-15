import { apiRequest } from "@/api/client";

export async function safeFetch<T = Record<string, never>>(
  url: string,
  options?: RequestInit,
): Promise<T | Record<string, never>> {
  try {
    return await apiRequest<T>(url, options);
  } catch {
    return {};
  }
}
