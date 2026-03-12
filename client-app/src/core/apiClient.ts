import axios from "axios";
import { generateCorrelationId } from "./correlation";
import { API_BASE_URL } from "@/config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers["X-Correlation-Id"] = generateCorrelationId();
  return config;
});

export default api;
