const REQUIRED = ["VITE_API_BASE_URL"] as const;

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !import.meta.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

function requireEnv(key: (typeof REQUIRED)[number]): string {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  API_BASE_URL: requireEnv("VITE_API_BASE_URL"),
  IS_PROD: import.meta.env.PROD,
};
