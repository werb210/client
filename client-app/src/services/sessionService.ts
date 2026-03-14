import { apiFetch } from "../lib/apiFetch";

function getClientSessionToken() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("client_session");
  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored);
    return typeof session?.token === "string" ? session.token : null;
  } catch {
    return stored;
  }
}

export async function getSession() {
  return apiFetch("/api/auth/me");
}

export async function refreshClientSession() {
  const token = getClientSessionToken();
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
