export const BASE = import.meta.env.VITE_STAFF_API_URL || 'https://staff.boreal.financial/api';
export const TOKEN = import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || '';
export const USE_LOCAL_PRODUCTS =
  import.meta.env.VITE_LOCAL_FALLBACK === 'true' && !import.meta.env.PROD; // never true in prod