const getEnv = (key: string, fallback?: string) => {
  const value = import.meta.env[key];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  return undefined;
};

export const ENV = {
  VITE_API_BASE_URL:
    getEnv("VITE_API_BASE_URL", "https://boreal-staff-server-e4hmaqbkb2g5hgfv.canadacentral-01.azurewebsites.net"),
};
