import { runtimeConfig } from "./runtimeConfig";

export function validateEnv() {
  if (!runtimeConfig.API_BASE) {
    console.warn("Missing runtime config: API_BASE");
  }
}
