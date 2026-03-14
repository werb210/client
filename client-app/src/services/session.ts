import { apiFetch } from "../lib/apiFetch";

export function getSession() {
  return apiFetch("/session");
}

export function startOtp(phone: string) {
  return apiFetch("/api/auth/otp/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(code: string) {
  return apiFetch("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
