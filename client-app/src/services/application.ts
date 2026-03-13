import { apiRequest } from "../api/client";

export async function updateApplication(payload: any) {
  const data = await apiRequest("/api/application/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!data) {
    return { ok: false };
  }

  return data;
}
