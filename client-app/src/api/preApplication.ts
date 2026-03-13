import { apiRequest } from "@/api/client";

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
  return (apiRequest(
    `/api/preapp/lookup?email=${encodeURIComponent(email)}`
  ) as Promise<PreApplicationLookupResponse>).catch((): null => null);
}

export async function consumePreApplication(token: string): Promise<any> {
  return apiRequest("/api/preapp/consume", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
