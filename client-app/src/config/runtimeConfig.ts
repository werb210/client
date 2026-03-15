declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

function normalizeBase(candidate?: string) {
  return (candidate || "").trim().replace(/\/$/, "");
}

export const runtimeConfig = {
  API_BASE: normalizeBase(window.RUNTIME_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_URL || ""),
};
