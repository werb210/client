export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...(data || {}),
    });
  }
}
