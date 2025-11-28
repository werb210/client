import axios from "axios";

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

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err?.response || err);
    throw err;
  }
);
