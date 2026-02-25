import api from "@/lib/api";

export type ClientLender = { id: string; name: string };
export type ClientLenderProduct = {
  id: string;
  name: string;
  product_type?: string;
  country: string;
  amount_min: number | null;
  amount_max: number | null;
  term?: string | number | null;
  rate?: number | string | null;
  required_documents?: any[];
  lender_id: string;
  lender_name?: string;
  status?: string;
};

export type LenderProductRequirement = {
  id: string;
  document_type: string;
  required: boolean;
  min_amount?: number | null;
  max_amount?: number | null;
};

export async function getClientLenders(): Promise<ClientLender[]> {
  const res: any = await api.get("/api/client/lenders");
  return res?.data?.data as any;
}

export async function getClientLenderProducts(): Promise<ClientLenderProduct[]> {
  const res: any = await api.get("/api/client/lender-products");
  if (Array.isArray(res?.data?.data)) {
    return res?.data?.data as any;
  }
  return Array.isArray(res?.data) ? (res?.data as any) : [];
}
