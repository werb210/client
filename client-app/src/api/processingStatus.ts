import { api } from "./client";
import type { ProcessingStatus } from "@/types/processing";

export async function fetchProcessingStatus(
  applicationId: string
): Promise<ProcessingStatus> {
  const response = await api.get<ProcessingStatus>(
    `/api/applications/${applicationId}/processing-status`
  );
  return response.data;
}
