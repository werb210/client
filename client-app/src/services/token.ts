const TOKEN_KEYS = ["boreal_token", "boreal_portal_session_token"];

export function getAccessToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const sessionValue = sessionStorage.getItem(key);
    if (sessionValue) {
      return sessionValue;
    }

    const localValue = localStorage.getItem(key);
    if (localValue) {
      return localValue;
    }
  }

  return null;
}

export function clearStoredAuth() {
  for (const key of TOKEN_KEYS) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

