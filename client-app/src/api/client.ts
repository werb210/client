import axios from "axios";

export const API_BASE_URL = "https://api.staff.boreal.financial";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err);
    return Promise.reject(err);
  }
);
