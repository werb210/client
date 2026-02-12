import.meta.env = import.meta.env || {};

function requireEnv(key: string): string {
  const value =
    (import.meta as any)?.env?.[key] ??
    (process.env?.[key] as string | undefined);

  if (!value) {
    // Allow tests to run without crashing
    if (process.env.NODE_ENV === "test") {
      return "http://localhost:3000";
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
