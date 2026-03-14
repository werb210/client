import { apiFetch } from "../lib/apiFetch";

export interface SaveApplicationStepPayload {
  applicationId: string;
  step: number;
  data: Record<string, any>;
}

export interface ContinuationSessionResponse {
  exists: boolean;
  applicationId?: string;
  step?: number;
  data?: Record<string, any>;
}

export async function bootstrapContinuation() {
  if (sessionStorage.getItem("continuation_checked")) return;

  sessionStorage.setItem("continuation_checked", "true");

  return fetchApplicationContinuation();
}

export async function fetchApplicationContinuation() {
  return apiFetch("/api/application/continuation") as Promise<ContinuationSessionResponse>;
}

export async function saveApplicationStep(payload: SaveApplicationStepPayload) {
  await apiFetch("/api/application", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function saveApplicationProgress(data: any) {
  return apiFetch("/api/application", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function updateApplication(data: any) {
  return apiFetch("/api/application/update", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function continueApplication(data: any) {
  return apiFetch("/api/application/continuation", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function submitApplication(data: any) {
  return apiFetch("/api/readiness", {
    method: "POST",
    body: JSON.stringify(data)
  });
}
