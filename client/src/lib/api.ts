// client/src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getLenderProducts() {
  const res = await fetch(`${API_BASE}/lender-products`);
  if (!res.ok) throw new Error("Failed to fetch lender products");
  const { data } = await res.json();
  return data;
}

export async function getPipelineCards() {
  const res = await fetch(`${API_BASE}/pipeline/cards`);
  if (!res.ok) throw new Error("Failed to fetch pipeline cards");
  const { data } = await res.json();
  return data;
}

// Legacy compatibility
export async function fetchLenderProducts() {
  return await getLenderProducts();
}

export async function fetchFromProduction(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
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