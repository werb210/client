const API_BASE = import.meta.env.VITE_API_BASE;

/**
 * ❌ DISABLED: Client cannot fetch lender products
 * All lender data is processed server-side by Staff App
 */
export async function getLenderProducts() {
  throw new Error("Lender product access restricted - handled server-side only");
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
 * ❌ DISABLED: Legacy lender product fetch
 */
export async function fetchLenderProducts() {
  throw new Error("Lender product access restricted - handled server-side only");
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