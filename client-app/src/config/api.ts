const DEFAULT_API_ORIGIN = "https://api.staff.boreal.financial"

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || `${DEFAULT_API_ORIGIN}/api`

export function apiUrl(path: string) {
  if (path.startsWith("/")) {
    return `${API_BASE}${path}`
  }

  return `${API_BASE}/${path}`
}
