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
  const response = await apiClient.post("/api/auth/otp/verify", {
    phone: normalizePhone(phone),
    code,
  });

  const token = response.data?.token || response.data?.sessionToken;
  if (token && typeof localStorage !== "undefined") {
    const session = {
      token,
      phone,
      authenticated: true,
      createdAt: Date.now(),
    };

    localStorage.setItem("client_session", JSON.stringify(session));
  }

  return response.data;
}
