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

const CONTACT_DEDUP_KEY = "boreal_contact_submission_cache";
const READINESS_DEDUP_KEY = "boreal_readiness_submission_cache";

function normalize(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

function dedupKey(payload: { email?: string; phone?: string }) {
  return `${normalize(payload.email)}::${normalize(payload.phone)}`;
}

function loadCache(storageKey: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(storageKey: string, cache: Record<string, unknown>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
}

export async function submitCreditReadiness(payload: CreditReadinessPayload) {
  const key = dedupKey(payload);
  if (key !== "::") {
    const cache = loadCache(READINESS_DEDUP_KEY);
    if (cache[key]) {
      return cache[key];
    }
  }

  try {
    const res = await api.post("/website/credit-readiness", payload);
    const responseData = res.data;
    if (key !== "::") {
      const cache = loadCache(READINESS_DEDUP_KEY);
      cache[key] = responseData;
      saveCache(READINESS_DEDUP_KEY, cache);
    }
    return responseData;
  } catch {
    throw new Error("Unable to submit credit readiness. Please try again.");
  }
}

export async function submitContactForm(payload: {
  companyName: string;
  fullName: string;
  phone: string;
  email: string;
  message?: string;
}) {
  const key = dedupKey(payload);
  if (key !== "::") {
    const cache = loadCache(CONTACT_DEDUP_KEY);
    if (cache[key]) {
      return cache[key];
    }
  }

  try {
    const res = await api.post("/website/contact", payload);
    const responseData = res.data;
    if (key !== "::") {
      const cache = loadCache(CONTACT_DEDUP_KEY);
      cache[key] = responseData;
      saveCache(CONTACT_DEDUP_KEY, cache);
    }
    return responseData;
  } catch {
    throw new Error("Unable to submit contact form. Please try again.");
  }
}
