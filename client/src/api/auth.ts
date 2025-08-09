import { apiPost, apiGet, setBearer } from './http';

export async function login(email: string, password: string) {
  const res = await apiPost('/api/auth/login', { email, password });
  const tok = res?.bearer ?? res?.token ?? null;  // accept either; prefer 'bearer'
  if (res?.ok && tok) setBearer(tok);
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