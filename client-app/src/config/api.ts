export const API_BASE = "https://api.staff.boreal.financial";
export const API_BASE_URL = API_BASE;

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return `${API_BASE}${path}`;
}
