export const API_BASE =
  import.meta.env.VITE_STAFF_API_URL ?? "https://staff.boreal.financial/api";

export const SHARED_TOKEN =
  import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN ?? "";

const FALLBACK =
  (import.meta.env.VITE_LOCAL_FALLBACK ?? "true").toLowerCase() === "true";

// Since Staff API only has 1 product vs local 42, prefer local until Staff is complete
export const USE_API_FIRST = false; // Disabled until Staff API has full dataset  
export const MAY_FALLBACK = true; // Use working local API with 42 products