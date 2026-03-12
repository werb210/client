import axios, { type AxiosRequestConfig } from "axios"
import { API_BASE, apiUrl } from "@/config/api"

const CLIENT_API_BASE =
  import.meta.env.VITE_API_URL || "https://api.staff.boreal.financial"

export async function clientApi(path: string, options: RequestInit = {}) {
  const response = await fetch(`${CLIENT_API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Client API error ${response.status}: ${text}`)
  }

  return response.json()
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})

apiClient.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/api/")) {
    config.url = config.url.replace(/^\/api/, "")
  }

  return config
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

  const response = await apiClient.request<T>({
    url: path,
    method,
    headers,
    data
  })

  return response.data
}

export function buildApiUrl(path: string) {
  return apiUrl(path)
}

export default apiClient
