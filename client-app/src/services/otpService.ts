import { normalizePhone } from "../utils/normalizePhone";

const API = "https://server.boreal.financial/api/auth";

export async function requestOtp(phone: string) {
  const normalized = normalizePhone(phone);

  const res = await fetch(`${API}/request-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: normalized,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTP request failed: ${text}`);
  }

  return res.json();
}

export async function startOtp(phone: string) {
  return requestOtp(phone);
}

export async function verifyOtp(phone: string, code: string) {
  const normalized = normalizePhone(phone);

  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone: normalized,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OTP verification failed: ${text}`);
  }

  return res.json();
}
