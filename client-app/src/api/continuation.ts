export interface ContinuationPayload {
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
  const res = await fetch(`/api/application/continuation/${token}`);
  if (!res.ok) return null;
  return (await res.json()) as ContinuationPayload;
}
