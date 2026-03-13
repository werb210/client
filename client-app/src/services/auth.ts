import { API_BASE } from "../config/api";
import { safeFetch } from "../lib/safeFetch";

export async function verifyOtp(phone: string, code: string) {
  const data = await safeFetch(`${API_BASE}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });

  if (!data) {
    return { ok: false };
  }

  return data;
}
