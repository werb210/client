import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchLenderCategories() {
  const res = await axios.get(`${API_BASE}/lenders/categories`, {
    withCredentials: true,
  });
  return res.data;
}
