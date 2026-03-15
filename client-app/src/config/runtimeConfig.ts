declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

function isLocalHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function normalizeApiBase(candidate?: string) {
  const value = (candidate || "").trim();
  if (!value) {
    return "/api";
  }

  if (isLocalHost() && isAbsoluteUrl(value)) {
    return "/api";
  }

  return value;
}

export const runtimeConfig = {
  API_BASE: normalizeApiBase(window.RUNTIME_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_URL || "/api"),
};
