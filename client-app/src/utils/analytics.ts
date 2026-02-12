export function trackEvent(eventName: string, payload: any = {}) {
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
