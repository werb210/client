type RequiredEnv = {
  VITE_API_BASE_URL: string;
  VITE_APP_ENV: string;
};

function requireEnv(key: keyof RequiredEnv): string {
  const value = import.meta.env[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  API_BASE_URL: requireEnv("VITE_API_BASE_URL"),
  APP_ENV: requireEnv("VITE_APP_ENV"),
  IS_PROD: requireEnv("VITE_APP_ENV") === "production",
};
