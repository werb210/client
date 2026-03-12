import axios from "axios"

const base =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.staff.boreal.financial/api"

export const apiClient = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})

export const api = apiClient

export default apiClient
