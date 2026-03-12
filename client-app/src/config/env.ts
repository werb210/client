import { getRuntimeConfig } from "./runtimeConfig";

export function validateEnv() {
  const { API_URL, API_BASE_URL } = getRuntimeConfig();

  if (!API_URL || !API_BASE_URL) {
    console.warn("Missing runtime config: API_URL or API_BASE_URL");
  }
}
