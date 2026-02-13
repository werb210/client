export type ChatRole = "user" | "ai" | "staff";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  message: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  status: "ai" | "human" | "closed";
  channel?: "chat" | "voice";
}

export interface LeadCaptureInput {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface QualificationInput {
  industry: string;
  yearsInBusiness: string;
  monthlyRevenue: string;
  annualRevenue: string;
  accountsReceivableOutstanding: string;
  existingDebt: string;
}
