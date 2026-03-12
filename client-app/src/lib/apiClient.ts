import axios from "axios";
import { API_TIMEOUT } from "../config/api";
import { getRuntimeConfig } from "../config/runtimeConfig";

export const apiClient = axios.create({
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const { API_URL } = getRuntimeConfig();
  config.baseURL = API_URL.replace(/\/$/, "");
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Client API error:", error?.response || error);
    return Promise.reject(error);
  }
);

export default apiClient;
