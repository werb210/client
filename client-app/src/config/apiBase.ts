import { getRuntimeConfig } from "./runtimeConfig";

export function getApiBase() {
  const { API_BASE_URL } = getRuntimeConfig();
  return API_BASE_URL.replace(/\/$/, "");
}

export const API_BASE = getApiBase;
