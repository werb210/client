import api from "@/lib/api";

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
