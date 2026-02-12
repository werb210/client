import.meta.env = import.meta.env || {};

export function requireEnv(key: string): string {
  const value = (import.meta as any)?.env?.[key];

  // Allow tests without crash
  if (!value || typeof value !== "string") {
    if (process.env.NODE_ENV === "test") {
      return "";
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const API_BASE_URL = requireEnv("VITE_API_BASE_URL");

export const ENV = {
  API_BASE_URL,
  IS_PROD: import.meta.env.PROD,
};

export function validateEnv() {
  requireEnv("VITE_API_BASE_URL");
}
