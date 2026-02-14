import api from "@/api";

export interface LeadBootstrapPayload {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  industry?: string;
}

export interface LeadBootstrapResponse {
  leadId: string;
  pendingApplicationId: string;
}

export async function createLead(payload: LeadBootstrapPayload) {
  const res = await api.post<LeadBootstrapResponse>("/lead/bootstrap", payload);
  return res.data;
}

export async function tagLead(leadId: string, tag: string) {
  const res = await api.post("/lead/tag", { leadId, tag });
  return res.data;
}
