const API_PREFIX = '/api';

const toSameOrigin = (p: string) => {
  if (!p) return API_PREFIX;
  try { 
    if (/^https?:\/\//i.test(p)) { 
      const u = new URL(p); 
      return u.pathname + u.search; 
    } 
  } catch {}
  return p.startsWith('/') ? p : `/${p}`;
};

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const norm = toSameOrigin(path).replace(/^\/api(?!\/)/, '/api/');
  const res = await fetch(norm, { 
    credentials: 'include', 
    headers: { 
      'Content-Type': 'application/json', 
      ...(init.headers || {}) 
    }, 
    ...init 
  });
  
  if (!res.ok) {
    throw new Error(`[api] ${res.status} ${res.statusText} for ${norm}`);
  }
  
  return res.json() as Promise<T>;
}