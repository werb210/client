export type ProcessingStatus = {
  ocr: {
    status: "pending" | "processing" | "completed" | "failed";
    completedAt: string | null;
  };
  banking: {
    status: "pending" | "processing" | "completed" | "failed";
    completedAt: string | null;
    statementCount: number;
    requiredStatements: number;
  };
};
