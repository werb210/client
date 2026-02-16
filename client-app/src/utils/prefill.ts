import axios from "axios";

export interface CreditPrefill {
  companyName: string;
  industry: string;
  yearsInBusiness: string;
  annualRevenue: string;
  monthlyRevenue: string;
  arBalance: string;
  availableCollateral: string;
  fullName: string;
  email: string;
  phone: string;
}

export async function fetchPrefill(token: string): Promise<CreditPrefill | null> {
  try {
    const res = await axios.post("/api/prefill/validate", { token });
    return res.data || null;
  } catch {
    return null;
  }
}
