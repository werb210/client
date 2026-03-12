export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://server.boreal.financial";

export const API_TIMEOUT = 30000;

export function apiUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
