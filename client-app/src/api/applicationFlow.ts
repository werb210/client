import { apiFetch } from "../lib/apiClient";

export async function getContinuation() {
  return apiFetch("/api/application/continuation");
}

export async function updateApplication(payload: unknown) {
  return apiFetch("/api/application/update", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function createApplication(payload: unknown) {
  return apiFetch("/api/application", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function submitReadiness(payload: unknown) {
  return apiFetch("/api/readiness", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function continueReadiness(payload: unknown) {
  return apiFetch("/api/readiness/continue", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getReadinessSession(sessionId: string) {
  return apiFetch(`/api/readiness/${encodeURIComponent(sessionId)}`);
}
