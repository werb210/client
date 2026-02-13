import api from "@/api";

export interface CreditReadinessPayload {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  industry?: string;
  yearsInBusiness?: string;
  monthlyRevenue?: string;
  annualRevenue?: string;
  arOutstanding?: string;
  existingDebt?: string;
}

export async function submitCreditReadiness(payload: CreditReadinessPayload) {
  const res = await api.post("/website/credit-readiness", payload);
  return res.data;
}

export async function submitContactForm(payload: {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  message?: string;
}) {
  const res = await api.post("/website/contact", payload);
  return res.data;
}
