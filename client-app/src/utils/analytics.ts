export function trackEvent(
  eventName: string,
  payload: Record<string, unknown> = {}
) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      timestamp: Date.now(),
      app: "client",
      ...payload,
    });
  }

  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        payload,
      }),
    });
  } catch (err) {
    console.warn("Analytics error", err);
  }
}

export function trackConversion(
  type: string,
  payload: Record<string, unknown> = {}
) {
  trackEvent("client_conversion", {
    conversion_type: type,
    ...payload,
  });
}

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
