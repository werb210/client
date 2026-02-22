import axios from "axios";
import { generateCorrelationId } from "./correlation";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers["X-Correlation-Id"] = generateCorrelationId();
  return config;
});

export default api;
