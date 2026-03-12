import axios, { type AxiosRequestConfig } from "axios"
import { API_BASE_URL } from "@/config/api"

const API_BASE = API_BASE_URL

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE}${normalizedPath}`
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
    url: path,
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
