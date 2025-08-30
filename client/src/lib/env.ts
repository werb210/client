export const API_BASE =
  import.meta.env.VITE_STAFF_API_URL ?? "https://staff.boreal.financial/api";

export const SHARED_TOKEN =
  import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ?? "";

const FALLBACK =
  (import.meta.env.VITE_LOCAL_FALLBACK ?? "true").toLowerCase() === "true";

// Respect environment variables properly
export const USE_API_FIRST = !FALLBACK; // Use Staff API when local fallback is disabled
export const MAY_FALLBACK = FALLBACK; // Use local API only when fallback is enabled