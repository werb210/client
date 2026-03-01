import { apiRequest } from "@/services/api";

type PreApplicationLookupResponse = {
  token: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  annualRevenue?: string;
  requestedAmount?: string | number;
  yearsInBusiness?: string;
};

export async function lookupPreApplication(
  email: string
): Promise<PreApplicationLookupResponse | null> {
  return apiRequest<PreApplicationLookupResponse>(
    `/api/preapp/lookup?email=${encodeURIComponent(email)}`
  ).catch(() => null);
}

export async function consumePreApplication(token: string) {
  return apiRequest("/api/preapp/consume", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
