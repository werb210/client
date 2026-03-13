import { apiRequest } from "../api/client";

export async function requestOtp(phone: string) {
  const data = await apiRequest("/api/auth/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  if (!data) {
    return { ok: false };
  }

  return data;
}

export async function verifyOtp(phone: string, code: string) {
  const data = await apiRequest("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });

  if (!data) {
    return { ok: false };
  }

  return data;
}
