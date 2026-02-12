export function trackEvent(name: string, data?: any) {
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: name,
      ...data,
    });
    return;
  }

  if (typeof window !== "undefined") {
    (window as any).dataLayer = [];
    (window as any).dataLayer.push({
      event: name,
      ...data,
    });
  }
}
