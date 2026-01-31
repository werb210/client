export type PipelinePollerOptions<T> = {
  token: string;
  fetchStatus: (token: string) => Promise<T>;
  onUpdate: (status: T) => void;
  onError?: (error: unknown) => void;
  intervalMs?: number;
};

export function createPipelinePoller<T>({
  token,
  fetchStatus,
  onUpdate,
  onError,
  intervalMs = 5000,
}: PipelinePollerOptions<T>) {
  let active = true;
  const poll = async () => {
    if (!active) return;
    try {
      const status = await fetchStatus(token);
      if (active) {
        onUpdate(status);
      }
    } catch (error) {
      if (active) {
        onError?.(error);
      }
    }
  };
  void poll();
  const id = setInterval(poll, intervalMs);
  return () => {
    active = false;
    clearInterval(id);
  };
}

export function getPipelineStage(status: any) {
  const raw =
    status?.status ||
    status?.stage ||
    status?.pipelineStatus ||
    status?.state ||
    "";
  const normalized = String(raw).toLowerCase();
  if (normalized.includes("offer")) return "Offer";
  if (normalized.includes("lender")) return "Off to Lender";
  if (normalized.includes("additional")) return "Additional Steps Required";
  if (normalized.includes("document")) return "Documents Required";
  if (normalized.includes("review")) return "In Review";
  return "Received";
}
