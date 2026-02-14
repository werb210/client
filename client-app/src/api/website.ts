import api from "@/api";
import { getContinuationSession } from "@/api/continuation";

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
const READINESS_TOKEN_KEY = "boreal_readiness_token";
export const READINESS_SESSION_ID_KEY = "boreal_readiness_session_id";
const SESSION_ID_QUERY_PARAM = "sessionId";

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
      const cached = cache[key] as Record<string, unknown>;
      persistReadinessSession(cached);
      return cached;
    }
  }

  const existingSession = await findExistingReadinessSession(payload);
  if (existingSession) {
    persistReadinessSession(existingSession);
    if (key !== "::") {
      const cache = loadCache(READINESS_DEDUP_KEY);
      cache[key] = existingSession;
      saveCache(READINESS_DEDUP_KEY, cache);
    }
    return existingSession;
  }

  try {
    const res = await api.post("/api/readiness", payload, {
      headers: {
        "X-Idempotency-Key": key !== "::" ? `readiness:${key}` : crypto.randomUUID(),
      },
    });
    const responseData = res.data;
    persistReadinessSession(responseData);
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
    const res = await api.post("/api/contact", payload, {
      headers: {
        "X-Idempotency-Key": key !== "::" ? `contact:${key}` : crypto.randomUUID(),
      },
    });
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

export function getStoredReadinessToken() {
  try {
    return localStorage.getItem(READINESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredReadinessSessionId() {
  try {
    return localStorage.getItem(READINESS_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function clearStoredReadinessSession() {
  try {
    localStorage.removeItem(READINESS_SESSION_ID_KEY);
    localStorage.removeItem(READINESS_TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
}

export function getReadinessSessionIdFromUrl(search: string) {
  const queryValue = new URLSearchParams(search).get(SESSION_ID_QUERY_PARAM);
  if (!queryValue) return null;
  const normalized = queryValue.trim();
  return normalized || null;
}

export function resolveReadinessSessionId(search?: string) {
  const querySessionId =
    typeof search === "string" ? getReadinessSessionIdFromUrl(search) : null;
  if (querySessionId) {
    try {
      localStorage.setItem(READINESS_SESSION_ID_KEY, querySessionId);
    } catch {
      // ignore storage failures
    }
    return querySessionId;
  }

  return getStoredReadinessSessionId();
}

function persistReadinessSession(payload: Record<string, unknown> | null | undefined) {
  const sessionId =
    (typeof payload?.readinessSessionId === "string" && payload.readinessSessionId) ||
    (typeof payload?.sessionId === "string" && payload.sessionId) ||
    null;
  const readinessToken =
    (typeof payload?.readinessToken === "string" && payload.readinessToken) ||
    (typeof payload?.token === "string" && payload.token) ||
    null;

  try {
    if (sessionId) {
      localStorage.setItem(READINESS_SESSION_ID_KEY, sessionId);
    }
    if (readinessToken) {
      localStorage.setItem(READINESS_TOKEN_KEY, readinessToken);
    }
  } catch {
    // ignore storage failures
  }
}

async function findExistingReadinessSession(payload: CreditReadinessPayload) {
  try {
    const session = await getContinuationSession();
    if (!session || typeof session !== "object") return null;
    const sessionEmail = normalize(session.email as string | undefined);
    const sessionPhone = normalize(session.phone as string | undefined);
    const payloadEmail = normalize(payload.email);
    const payloadPhone = normalize(payload.phone);
    if (!sessionEmail && !sessionPhone) return null;
    const matchesEmail = payloadEmail && payloadEmail === sessionEmail;
    const matchesPhone = payloadPhone && payloadPhone === sessionPhone;
    if (!matchesEmail && !matchesPhone) return null;
    return session as Record<string, unknown>;
  } catch {
    return null;
  }
}
