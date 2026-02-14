import api from "@/api";

export type LeadPayload = {
  companyName?: string;
  fullName: string;
  email: string;
  phone: string;

  yearsInBusiness?: string;
  annualRevenue?: string;
  monthlyRevenue?: string;
  requestedAmount?: string;
  creditScoreRange?: string;

  productInterest?: string;
  industryInterest?: string;

  source: string;
};

export async function createLead(payload: LeadPayload) {
  return api.post("/crm/leads", payload);
}
