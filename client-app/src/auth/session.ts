import { getAccessToken } from "@/services/token";

export function getOtpSession(): string | null {
  try {
    return getAccessToken();
  } catch {
    return null;
  }
}
