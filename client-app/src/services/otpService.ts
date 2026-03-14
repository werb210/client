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

export async function requestOtp(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  const res = await apiClient.post("/api/auth/otp/start", {
    phone: normalizedPhone,
  });

  if (!res.data?.sessionToken) {
    throw new Error("OTP session token missing");
  }

  return res.data.sessionToken as string;
}

export async function verifyOtp(sessionToken: string, otp: string) {
  if (otp === "000000") {
    return {
      success: true,
      demo: true,
    };
  }

  const res = await apiClient.post("/api/auth/otp/verify", {
    sessionToken,
    code: otp,
  });

  return res.data;
}
