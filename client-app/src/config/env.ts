export function requireEnv(key: string): string {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  if (typeof value === "string") return value;
  if (process.env.NODE_ENV === "test") return "";
  throw new Error(`Missing required environment variable: ${key}`);
}

export function validateEnv(): void {
  ["VITE_API_BASE_URL"].forEach((key) => {
    if (!requireEnv(key)) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });
}

export const API_BASE_URL = requireEnv("VITE_API_BASE_URL");
