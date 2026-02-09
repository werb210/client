export type ProcessingCheckpoint = {
  status: "pending" | "processing" | "completed" | "failed";
  completedAt: string | null;
  details?: {
    receivedCount?: number | null;
    requiredCount?: number | null;
  };
};

export type ProcessingStatus = {
  documentReview: ProcessingCheckpoint;
  financialReview: ProcessingCheckpoint;
};
