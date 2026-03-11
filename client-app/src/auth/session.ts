export function getOtpSession(): string | null {
  try {
    return sessionStorage.getItem("boreal_portal_session_token");
  } catch {
    return null;
  }
}
