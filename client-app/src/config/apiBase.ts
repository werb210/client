export const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE ||
  window?.__ENV?.API_BASE ||
  "http://localhost:4000";

export default API_BASE;
