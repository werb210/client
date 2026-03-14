import { apiRequest } from "../api/client";

type ApiPayload = Record<string, any> | null;

function pickFirstString(payload: ApiPayload, keys: string[]): string {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function isOk(payload: ApiPayload): boolean {
  if (!payload || typeof payload !== "object") return false;
  if (payload.ok === true) return true;
  if (payload.success === true) return true;
  if (payload.verified === true) return true;
  if (typeof payload.status === "string" && payload.status.toLowerCase() === "ok") return true;
  return false;
}

export type OtpRequestResult = {
  ok: boolean;
  demoCode?: string;
  message?: string;
};

export type OtpVerifyResult = {
  ok: boolean;
  sessionToken?: string;
  applicationToken?: string;
  submittedToken?: string;
};

export async function requestOtp(phone: string) {
  const data = (await apiRequest("/api/auth/otp/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  }).catch(() => null)) as ApiPayload;

  return {
    ok: isOk(data),
    demoCode: pickFirstString(data, ["demoCode", "otp", "code", "verificationCode"]),
    message: pickFirstString(data, ["message", "error"]),
  } satisfies OtpRequestResult;
}

export async function startOtp(phone: string) {
  return requestOtp(phone);
}

export async function verifyOtp(phoneOrSessionToken: string, code: string) {
  const data = (await apiRequest("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionToken: phoneOrSessionToken, phone: phoneOrSessionToken, code }),
  }).catch(() => null)) as ApiPayload;

  return {
    ok: isOk(data),
    sessionToken: pickFirstString(data, ["sessionToken", "accessToken", "token"]),
    applicationToken: pickFirstString(data, ["applicationToken", "submissionId", "leadToken"]),
    submittedToken: pickFirstString(data, ["submittedToken", "portalToken"]),
  } satisfies OtpVerifyResult;
}
