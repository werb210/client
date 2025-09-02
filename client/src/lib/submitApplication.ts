/**
 * Application submission logic with proper business criteria and CSRF handling
 */
import { ensureCsrf } from './csrf';

export type ApplicationState = {
  country: "CA" | "US" | null;
  amount: number;
  product_id: string | null;
  years_in_business: number | null;
  monthly_revenue: number | null;
};

export type BusinessProfile = {
  business_legal_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
};

export type DocumentInfo = {
  type: string;
  url?: string;
};

export async function submitApplication(
  state: ApplicationState, 
  profile: BusinessProfile, 
  documents: DocumentInfo[]
) {
  if (!state.product_id) throw new Error("No product selected");
  if (!state.country) throw new Error("Country is required");
  if (!state.years_in_business || !state.monthly_revenue) {
    throw new Error("Business criteria missing");
  }

  await ensureCsrf();

  const body = {
    product_id: state.product_id,
    country: state.country,
    amount: state.amount,
    years_in_business: state.years_in_business,
    monthly_revenue: state.monthly_revenue,
    business_legal_name: profile.business_legal_name,
    industry: profile.industry,
    contact_name: profile.contact_name,
    contact_email: profile.contact_email,
    contact_phone: profile.contact_phone,
    documents,
    client_session_id: crypto.randomUUID(),
  };

  const response = await fetch(`${import.meta.env.VITE_STAFF_API}/v1/applications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.status === 400) {
    const errorData = await response.json();
    // Show inline field errors from errorData.errors
    throw new Error((errorData.errors?.map((e: any) => e.message).join(" ")) || "Validation failed");
  }
  if (!response.ok) {
    throw new Error(`Submission failed (HTTP ${response.status})`);
  }

  return response.json(); // { ok: true, submission_id, status: "QUEUED" }
}