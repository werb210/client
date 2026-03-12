export const ENV = {
  API_URL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://server.boreal.financial"
};

export function validateEnv() {
  if (!ENV.API_URL) {
    console.warn("Missing environment variable: VITE_API_URL or VITE_API_BASE_URL");
  }
}
