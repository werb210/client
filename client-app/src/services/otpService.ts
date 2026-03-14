import { apiClient } from "../lib/apiClient";

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return `+${digits}`;
}

export async function startOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  await apiClient.post("/api/auth/otp/start", {
    phone: normalizedPhone,
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
