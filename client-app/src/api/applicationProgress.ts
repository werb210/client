import api from "@/api/client";

export async function bootstrapContinuation() {
  if (sessionStorage.getItem("continuation_checked")) return;

  sessionStorage.setItem("continuation_checked", "true");

  return fetchApplicationContinuation();
}

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

export async function fetchApplicationContinuation() {
  const response = await api.get<ContinuationSessionResponse>("/api/application/continuation");
  return response.data;
}

export async function saveApplicationStep(payload: SaveApplicationStepPayload) {
  await api.post("/api/application/save", payload);
}
