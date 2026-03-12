import axios from "axios"
import { API_BASE_URL } from "@/config/api"

const base = API_BASE_URL

export const apiClient = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})

export const api = apiClient

export default apiClient
