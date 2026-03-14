declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

export const runtimeConfig = {
  API_BASE:
    import.meta.env.VITE_API_URL ||
    window.RUNTIME_CONFIG?.API_BASE_URL ||
    "/api"
};
