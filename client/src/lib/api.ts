const API_BASE = import.meta.env.VITE_API_URL;

/**
 * ✅ ENABLED: Client-facing lender products API
 * Uses dedicated client endpoint with authentication
 */
export async function getLenderProducts() {
  const response = await fetch(`${API_BASE}/lender-products`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_CLIENT_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lender products: ${response.status}`);
  }

  return response.json();
}

/**
 * ✅ ALLOWED: Application submission
 */
export async function submitApplication(data: any) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit application");
  return res.json();
}

/**
 * ✅ ALLOWED: Document upload
 */
export async function uploadDocument(file: File, appId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("applicationId", appId);

  const res = await fetch(`${API_BASE}/documents`, { 
    method: "POST", 
    body: formData 
  });
  if (!res.ok) throw new Error("Failed to upload document");
  return res.json();
}

/**
 * ✅ ENABLED: Fetch lender products from client API
 */
export async function fetchLenderProducts() {
  return getLenderProducts();
}

/**
 * ✅ LIMITED: API fetch wrapper for allowed endpoints only
 */
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Only allow application and document endpoints
  if (!url.includes('/applications') && !url.includes('/documents')) {
    throw new Error(`API endpoint ${url} is restricted from client access`);
  }

  const fullUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? url : '/' + url}`;
  
  const mergedOptions: RequestInit = {
    credentials: 'include',
    headers: {
      ...options.headers,
    },
    ...options,
  };
  
  return fetch(fullUrl, mergedOptions);
}