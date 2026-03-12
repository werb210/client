import axios, { type AxiosRequestConfig } from "axios"

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.staff.boreal.financial/api"

export function buildApiUrl(path: string) {
  if (!path.startsWith("/")) path = "/" + path
  return API_BASE + path
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || "GET") as AxiosRequestConfig["method"]
  const headers = (options.headers || {}) as Record<string, string>
  const body = options.body
  let data: unknown = body
  if (typeof body === "string") {
    try {
      data = JSON.parse(body)
    } catch {
      data = body
    }
  }

  const response = await api.request<T>({
    url: path.startsWith("http") ? path : path,
    method,
    headers,
    data
  })

  return response.data
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  return apiRequest(path, options)
}

export default api
