import { api } from "./index";

// Fetch lender product categories from staff server
export async function fetchProductCategories() {
  return api.get("/products/categories");
}
