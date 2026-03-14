import api from "@/api/client";

export interface ContinuationResponse {
  pendingApplicationId?: string;
}

export async function checkContinuation(email: string): Promise<ContinuationResponse> {
  const res = await api.get<ContinuationResponse>(
    `/api/application/continuation?email=${encodeURIComponent(email)}`
  );
  return res.data;
}

export async function loadContinuation(): Promise<null> {
  return null;
}
