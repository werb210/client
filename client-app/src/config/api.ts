export { apiUrl, getApiBaseUrl } from "../api/request";

export const API_TIMEOUT = 30000;

export const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://server.boreal.financial/api";
