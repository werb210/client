export function track(event: string, metadata?: any) {
  fetch("/api/support/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata, source: "client_app" }),
  });
}
