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

const LEAD_CACHE_KEY = "boreal_lead_bootstrap_cache";
const pendingRequests = new Map<string, Promise<LeadBootstrapResponse>>();

function normalize(value: string | undefined) {
  return (value || "").trim().toLowerCase();
}

function getDedupKey(payload: LeadBootstrapPayload) {
  return `${normalize(payload.email)}::${normalize(payload.phone)}`;
}

function readLeadCache(): Record<string, LeadBootstrapResponse> {
  try {
    const raw = localStorage.getItem(LEAD_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LeadBootstrapResponse>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLeadCache(cache: Record<string, LeadBootstrapResponse>) {
  try {
    localStorage.setItem(LEAD_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

export async function createLead(payload: LeadBootstrapPayload) {
  const dedupKey = getDedupKey(payload);
  if (dedupKey !== "::") {
    const cached = readLeadCache()[dedupKey];
    if (cached?.leadId) {
      return cached;
    }

    const pending = pendingRequests.get(dedupKey);
    if (pending) {
      return pending;
    }
  }

  const request = api
    .post<LeadBootstrapResponse>("/lead/bootstrap", payload)
    .then((res) => {
      const data = res.data;
      if (dedupKey !== "::" && data?.leadId) {
        const cache = readLeadCache();
        cache[dedupKey] = data;
        writeLeadCache(cache);
      }
      return data;
    })
    .finally(() => {
      if (dedupKey !== "::") {
        pendingRequests.delete(dedupKey);
      }
    });

  if (dedupKey !== "::") {
    pendingRequests.set(dedupKey, request);
  }

  return request;
}

export async function tagLead(leadId: string, tag: string) {
  const res = await api.post("/lead/tag", { leadId, tag });
  return res.data;
}
