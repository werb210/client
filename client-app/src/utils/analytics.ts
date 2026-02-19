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
