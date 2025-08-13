import axios from "axios";
export const api = axios.create({ baseURL: "/api", withCredentials: true });

// Legacy compatibility wrapper for existing code that uses apiFetch
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  
  // Merge credentials with options
  const mergedOptions: RequestInit = {
    credentials: 'include',
    ...options,
  };
  
  return fetch(fullUrl, mergedOptions);
}