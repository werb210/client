export const API_BASE =
  import.meta.env.VITE_API_URL ||
  window.RUNTIME_CONFIG?.API_BASE_URL ||
  "/api";

export default API_BASE;
