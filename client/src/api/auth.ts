import { apiPost, apiGet, setBearer } from './http';

export async function login(email: string, password: string) {
  const res = await apiPost('/api/auth/login', { email, password });
  // If a token is provided, set it as a fallback for environments where cookies won't stick.
  if (res?.token) setBearer(res.token);
  return res;
}

export async function fetchMe() {
  try {
    const r = await apiGet('/api/rbac/auth/me');
    return r?.user ?? null;
  } catch {
    return null;
  }
}