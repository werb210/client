const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_CLIENT_API_KEY;

export async function getLenderProducts() {
  const res = await fetch(`${API_BASE}/public/lender-products`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch lender products: ${res.status}`);
  }

  const data = await res.json();
  return data.products;
}

export async function submitApplication(data: any) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit application");
  return res.json();
}

export async function uploadDocument(file: File, appId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("applicationId", appId);

  const res = await fetch(`${API_BASE}/documents`, { 
    method: "POST", 
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: formData 
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

// Legacy compatibility
export async function fetchLenderProducts() {
  return await getLenderProducts();
}

// Legacy compatibility wrapper for existing code that uses apiFetch
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  
  // Merge credentials and auth with options
  const mergedOptions: RequestInit = {
    credentials: 'include',
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      ...options.headers,
    },
    ...options,
  };
  
  return fetch(fullUrl, mergedOptions);
}