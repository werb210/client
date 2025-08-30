export const API_BASE =
  import.meta.env.VITE_STAFF_API_URL ?? "https://staff.boreal.financial/api";

export const SHARED_TOKEN =
  import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ?? "";

const FALLBACK =
  (import.meta.env.VITE_LOCAL_FALLBACK ?? "false").toLowerCase() === "true";

// Safety valve: always try API first; only use local cache *if* API fails.
export const USE_API_FIRST = true;
export const MAY_FALLBACK = FALLBACK; // keep the flag if you really want it