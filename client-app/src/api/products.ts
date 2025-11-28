import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

// Fetch lender product categories from staff server
export async function fetchProductCategories() {
  return axios.get(`${API_BASE}/products/categories`);
}
