import { apiRequest } from "@/services/api";

export function track(event: string, metadata?: any) {
  void apiRequest("/api/support/track", {
    method: "POST",
    body: JSON.stringify({ event, metadata, source: "client_app" }),
  }).catch(() => undefined);
}
