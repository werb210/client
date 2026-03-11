export const API_BASE_URL = "https://api.staff.boreal.financial";

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return `${API_BASE_URL}${path}`;
}
