import api from "./api";

export interface ContinuationPayload {
  leadId?: string;
  readinessToken?: string;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry?: string;
  yearsInBusiness?: number;
  monthlyRevenue?: number;
  annualRevenue?: number;
  arOutstanding?: number;
  existingDebt?: boolean;
}

export async function fetchContinuation(token: string): Promise<ContinuationPayload | null> {
  try {
    const res = await fetch(`/api/readiness/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    return (await res.json()) as ContinuationPayload;
  } catch {
    return null;
  }
}

export async function getContinuationSession() {
  try {
    const res = await api.get("/continuation/session");
    return res.data;
  } catch {
    return null;
  }
}
