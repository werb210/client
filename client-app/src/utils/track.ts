import { apiRequest } from "@/api/client";

export function track(event: string, metadata?: unknown): void {
  void apiRequest("/api/support/track", {
    method: "POST",
    body: JSON.stringify({ event, metadata, source: "client_app" }),
  }).catch(() => undefined);
}
