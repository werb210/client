import axios from "axios";
export const api = axios.create({ baseURL: "/api", withCredentials: true });

// Production API configuration
const API_URL = "https://staff.boreal.financial";
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

export async function fetchLenderProducts() {
  const res = await fetch(`${API_URL}/api/lender-products`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CLIENT_TOKEN}`,
    },
  });

  if (!res.ok) {
    console.error(`API Error [${res.status}] fetching lender products`);
    throw new Error("Failed to fetch lender products");
  }

  return res.json();
}

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