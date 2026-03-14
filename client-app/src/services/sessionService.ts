import { apiFetch } from "../lib/apiFetch";

export async function getSession() {
  return apiFetch("/session");
}

export async function refreshClientSession() {
  return apiFetch("/api/client/session/refresh", {
    method: "POST"
  });
}

export async function startOtp(payload: { phone?: string; email?: string }) {
  return apiFetch("/api/auth/otp/start", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyOtp(code: string) {
  return apiFetch("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ code })
  });
}
