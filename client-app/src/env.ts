const getEnv = (key: string, fallback?: string) => {
  const value = import.meta.env[key];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  return undefined;
};

export const ENV = {
  VITE_API_BASE_URL:
    getEnv("VITE_API_BASE_URL", "http://localhost:3000"),
};
