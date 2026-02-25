import api from "@/lib/api";
import type { ProcessingStatus } from "@/types/processing";
import {
  ProcessingStatusResponseSchema,
  parseApiResponse,
} from "@/contracts/clientApiSchemas";

type RawProcessingCheckpoint = {
  status?: string | null;
  completedAt?: string | null;
  completed_at?: string | null;
  receivedCount?: number | null;
  requiredCount?: number | null;
  statementCount?: number | null;
  requiredStatements?: number | null;
  [key: string]: any;
};

function normalizeStatus(value: any): ProcessingStatus["documentReview"]["status"] {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "completed" || normalized === "complete") return "completed";
  if (normalized === "processing" || normalized === "in_progress") return "processing";
  if (normalized === "failed" || normalized === "error") return "failed";
  return "pending";
}

function normalizeCheckpoint(raw?: RawProcessingCheckpoint | null) {
  return {
    status: normalizeStatus(raw?.status),
    completedAt: (raw?.completedAt || raw?.completed_at || null) as string | null,
    details: {
      receivedCount:
        (raw?.receivedCount ??
          raw?.statementCount ??
          (raw as any)?.received_count ??
          null) as number | null,
      requiredCount:
        (raw?.requiredCount ??
          raw?.requiredStatements ??
          (raw as any)?.required_count ??
          null) as number | null,
    },
  };
}

function isCheckpointLike(value: any): value is RawProcessingCheckpoint {
  if (!value || typeof value !== "object") return false;
  const status = (value as RawProcessingCheckpoint).status;
  return typeof status === "string";
}

function extractCheckpointCandidates(source: any): RawProcessingCheckpoint[] {
  if (!source || typeof source !== "object") return [];
  if (Array.isArray(source.steps)) {
    return source.steps.filter(isCheckpointLike);
  }
  if (Array.isArray(source.stages)) {
    return source.stages.filter(isCheckpointLike);
  }
  return Object.values(source).filter(isCheckpointLike);
}

export async function fetchProcessingStatus(
  applicationId: string
): Promise<ProcessingStatus> {
  const response = await api.get(
    `/api/applications/${applicationId}/processing/status`
  );
  const raw = parseApiResponse(
    ProcessingStatusResponseSchema,
    response.data,
    "GET /api/applications/{id}/processing/status"
  ) as any;

  const documentSource =
    raw?.documentReview ||
    raw?.document_review ||
    raw?.documents ||
    raw?.document_processing ||
    raw?.document;
  const financialSource =
    raw?.financialReview ||
    raw?.financial_review ||
    raw?.financials ||
    raw?.financial_processing ||
    raw?.financial;

  let documentCheckpoint = documentSource;
  let financialCheckpoint = financialSource;

  if (!documentCheckpoint || !financialCheckpoint) {
    const candidates = extractCheckpointCandidates(raw);
    if (!documentCheckpoint && candidates[0]) {
      documentCheckpoint = candidates[0];
    }
    if (!financialCheckpoint && candidates[1]) {
      financialCheckpoint = candidates[1];
    }
  }

  return {
    documentReview: normalizeCheckpoint(documentCheckpoint),
    financialReview: normalizeCheckpoint(financialCheckpoint),
  };
}
