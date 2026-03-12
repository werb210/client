import { getRuntimeConfig } from "./runtimeConfig";

export function getApiBase() {
  const { API_URL } = getRuntimeConfig();
  return API_URL.replace(/\/$/, "");
}

export const API_BASE = getApiBase;
