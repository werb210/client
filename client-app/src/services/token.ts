import { clearToken, getToken } from "@/auth/tokenStorage"

export function getAccessToken(): string | null {
  return getToken()
}

export function clearStoredAuth() {
  clearToken()
}
