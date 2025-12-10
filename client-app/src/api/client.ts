import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 10000
});

export function attachToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err);
    alert("A network error occurred. Please try again.");
    return Promise.reject(err);
  }
);
