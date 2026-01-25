import { api } from "./client";

export type ApplicationPayload = {
  business_name: string;
  requested_amount: number;
  lender_id: string;
  product_id: string;
};

export async function submitApplication(payload: ApplicationPayload) {
  const res = await api.post("/api/client/submissions", payload);
  return res.data;
}
