import api from "@/lib/api";

export interface ContinuationResponse {
  pendingApplicationId?: string;
}

export async function checkContinuation(email: string) {
  const res = await api.get<ContinuationResponse>(
    `/lead/continuation?email=${encodeURIComponent(email)}`
  );
  return res.data;
}
