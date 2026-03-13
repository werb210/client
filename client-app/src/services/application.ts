import { API_BASE } from "../config/api";
import { safeFetch } from "../lib/safeFetch";

export async function updateApplication(payload: any) {
  const data = await safeFetch(`${API_BASE}/application/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!data) {
    return { ok: false };
  }

  return data;
}
