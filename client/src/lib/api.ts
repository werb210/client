import axios from "axios";
export const api = axios.create({ baseURL: "/api", withCredentials: true });

const API_URL = import.meta.env.VITE_API_URL;
const CLIENT_TOKEN = import.meta.env.VITE_CLIENT_TOKEN;

export const fetchLenderProducts = async () => {
  const res = await fetch(`${API_URL}/api/lender-products`, {
    headers: {
      "Authorization": `Bearer ${CLIENT_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error(`[API] Lender products fetch failed: ${res.status}`);
    throw new Error("Failed to fetch lender products");
  }

  return res.json();
};

export async function fetchFromProduction(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CLIENT_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error(`Production API error [${res.status}] on ${path}`);
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}

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