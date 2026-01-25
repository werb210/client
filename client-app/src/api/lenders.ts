import { api } from "./client";

export type ClientLender = { id: string; name: string };
export type ClientLenderProduct = {
  id: string;
  name: string;
  product_type: string;
  min_amount: number | null;
  max_amount: number | null;
  lender_id: string;
  lender_name: string;
  status?: string;
};

export async function getClientLenders(): Promise<ClientLender[]> {
  const res = await api.get("/api/client/lenders");
  return res.data.data;
}

export async function getClientLenderProducts(): Promise<ClientLenderProduct[]> {
  const res = await api.get("/api/client/lender-products");
  return res.data.data;
}

export async function getClientLenderProductRequirements(productId: string) {
  const res = await api.get(`/api/client/lender-products/${productId}/requirements`);
  return res.data.data ?? res.data;
}
