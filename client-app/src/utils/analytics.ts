import { getPersistedAttribution } from "./attribution";

// ---- Client Attribution Sync ----

// ---- Consent Sync Layer ----

const CONSENT_KEY = "boreal_cookie_consent";

const hasTrackingConsent = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
};

export const getClientAttribution = () => {
  return getPersistedAttribution();
};

export const trackEvent = (
  eventName: string,
  payload: Record<string, any> = {}
) => {
  if (!hasTrackingConsent()) return;

  const attribution = getClientAttribution();

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, payload);
  }

  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      timestamp: Date.now(),
      app: "client",
      ...attribution,
      ...payload,
    });
  }

  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("set", eventName, payload);
  }

  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        payload: {
          ...attribution,
          ...payload,
        },
      }),
    });
  } catch (err) {
    console.warn("Analytics error", err);
  }
};

export const trackConversion = (
  eventName: string,
  payload: Record<string, any> = {}
) => {
  if (!hasTrackingConsent()) return;

  trackEvent(eventName, payload);
};

// ---- Client Revenue Modeling ----
const COMMISSION_RATE = 0.03; // Adjust later if needed

export const estimateClientCommission = (
  requestedAmount: number
): number => {
  return requestedAmount * COMMISSION_RATE;
};

export const calculateApplicationQuality = (data: {
  revenue: number;
  timeInBusiness: number;
  creditScore?: number;
}) => {
  let score = 0;

  if (data.revenue > 1000000) score += 2;
  else if (data.revenue > 250000) score += 1;

  if (data.timeInBusiness > 24) score += 2;
  else if (data.timeInBusiness > 12) score += 1;

  if (data.creditScore && data.creditScore > 700) score += 2;
  else if (data.creditScore && data.creditScore > 650) score += 1;

  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
};

// ---- Underwriting Readiness Engine ----

let underwritingScore = 0;

export const incrementUnderwritingScore = (points: number) => {
  underwritingScore += points;
};

export const classifyReadiness = () => {
  if (underwritingScore >= 8) return "ready";
  if (underwritingScore >= 4) return "partial";
  return "low";
};
