const DEFAULT_API_ORIGIN = "https://api.staff.boreal.financial";

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function stripApiSuffix(value: string): string {
  return value.replace(/\/api$/, "");
}

export function resolveApiBaseOrigin(): string {
  const configured =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    DEFAULT_API_ORIGIN;

  return stripApiSuffix(stripTrailingSlashes(configured));
}

export const API_BASE = resolveApiBaseOrigin();
export const API_BASE_URL = API_BASE;

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}
