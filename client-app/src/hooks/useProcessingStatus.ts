import { useCallback, useState } from "react";
import { fetchProcessingStatus } from "@/api/processingStatus";
import type { ProcessingStatus } from "@/types/processing";
import { useProcessingStatusPoller } from "./useProcessingStatusPoller";

export function isProcessingComplete(status: ProcessingStatus | null): boolean {
  if (!status) return false;
  return (
    status.documentReview.status === "completed" &&
    status.financialReview.status === "completed"
  );
}

export function useProcessingStatus(applicationId: string | null): { status: ProcessingStatus | null; pollState: ReturnType<typeof useProcessingStatusPoller>["state"] } {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);

  const fetchStatus = useCallback(
    () => fetchProcessingStatus(applicationId as string),
    [applicationId]
  );

  const { state } = useProcessingStatusPoller({
    enabled: Boolean(applicationId),
    fetchStatus,
    onUpdate: setStatus,
    onError: () => {},
    isTerminal: isProcessingComplete,
  });

  return { status, pollState: state };
}
