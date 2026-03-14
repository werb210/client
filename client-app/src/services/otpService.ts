import { apiClient } from "../lib/apiClient";

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (!input.startsWith("+")) {
    return `+${digits}`;
  }

  return input;
}

export async function startOtp(phone: string) {
  return apiClient.post("/api/auth/otp/start", {
    phone: normalizePhone(phone),
  });
}

export async function requestOtp(phone: string) {
  return startOtp(phone);
}

export async function verifyOtp(phone: string, code: string) {
  const normalizedPhone = normalizePhone(phone);

  return apiClient.post("/api/auth/otp/verify", {
    phone: normalizedPhone,
    code,
  });
}
