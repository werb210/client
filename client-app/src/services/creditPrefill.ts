import { apiRequest } from "@/services/api";

export async function fetchCreditPrefill(id: string) {
  return apiRequest(`/api/credit-readiness/${id}`);
}
