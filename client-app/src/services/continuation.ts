export interface ContinuationPayload {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry: string;
  yearsInBusiness?: string;
  monthlyRevenue?: string;
  annualRevenue?: string;
  arOutstanding?: string;
  existingDebt?: string;
}

export async function loadContinuation(email: string) {
  const res = await fetch(`/api/continuation/by-email?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchContinuation(token: string) {
  const res = await fetch(`/api/client/continuation/${token}`);
  if (!res.ok) return null;
  return res.json();
}
