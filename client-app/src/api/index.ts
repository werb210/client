import axios from "axios";
import { toastError } from "../components/toast/toastService";

const API_BASE = import.meta.env.VITE_API_URL || "https://YOUR_STAFF_SERVER_URL.com";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Attach clientToken to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clientToken");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

const handleError = (err: any) => {
  const message = err?.response?.data?.message || "Unexpected error";
  toastError(message);
  console.error("API ERROR:", err?.response || err);
  throw err;
};

// Global error handler
api.interceptors.response.use((res) => res, handleError);

axios.interceptors.response.use((res) => res, handleError);
