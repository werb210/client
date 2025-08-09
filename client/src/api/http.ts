let BEARER: string | null = null;

export function setBearer(tok: string | null) { BEARER = tok || null; }

// Resolve API base (same-origin default)
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || 'https://staff.boreal.financial/api';

async function handle(res: Response) {
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = body?.reason || body?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return body;
}

function withAuth(init?: RequestInit): RequestInit {
  const headers = new Headers((init && init.headers) || {});
  if (BEARER && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${BEARER}`);
  return { ...init, headers, credentials: 'include' }; // include cookies when available
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, withAuth());
  return handle(res);
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, withAuth({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }));
  return handle(res);
}