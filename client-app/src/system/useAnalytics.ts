// @ts-nocheck
export function trackEvent(name: string, data?: unknown) {
  if ((window as unknown).dataLayer) {
    (window as unknown).dataLayer.push({
      event: name,
      ...data,
    });
    return;
  }

  if (typeof window !== "undefined") {
    (window as unknown).dataLayer = [];
    (window as unknown).dataLayer.push({
      event: name,
      ...data,
    });
  }
}
