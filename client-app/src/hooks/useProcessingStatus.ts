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

export function useProcessingStatus(applicationId: string | null) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);

  const fetchStatus = useCallback(
    () => fetchProcessingStatus(applicationId as string),
    [applicationId]
  );

  const { state } = useProcessingStatusPoller({
    enabled: Boolean(applicationId),
    fetchStatus,
    onUpdate: setStatus,
    onError: (error) => {
      console.error("Processing status refresh failed:", error);
    },
    isTerminal: isProcessingComplete,
  });

  return { status, pollState: state };
}
