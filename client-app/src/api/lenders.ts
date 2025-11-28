import { api } from "./index";

export async function fetchLenderCategories() {
  const res = await api.get("/lenders/categories", {
    withCredentials: true,
  });
  return res.data;
}
