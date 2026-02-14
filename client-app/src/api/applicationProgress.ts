import { api } from "./client";

export interface SaveApplicationStepPayload {
  applicationId: string;
  step: number;
  data: Record<string, unknown>;
}

export interface ContinuationSessionResponse {
  exists: boolean;
  applicationId?: string;
  step?: number;
  data?: Record<string, unknown>;
}

export async function fetchApplicationContinuation() {
  const response = await api.get<ContinuationSessionResponse>("/api/application/continuation");
  return response.data;
}

export async function saveApplicationStep(payload: SaveApplicationStepPayload) {
  await api.post("/api/application/save", payload);
}
