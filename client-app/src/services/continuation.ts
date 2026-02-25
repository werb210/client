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

export async function loadContinuation(token?: string) {
  if (!token) return null;

  try {
    const response = await fetch(`/api/application/continuation?token=${token}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
