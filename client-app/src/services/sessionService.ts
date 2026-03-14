import { apiFetch } from "../lib/apiFetch";

export async function getSession() {
  return apiFetch("/api/auth/me");
}

export async function refreshClientSession() {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("client_session") : null;
  if (!token) {
    return null;
  }

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
