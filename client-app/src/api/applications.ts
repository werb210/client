import api from "@/lib/api";
import {
  ApplicationDocumentsResponseSchema,
  ApplicationOffersResponseSchema,
  FetchApplicationResponseSchema,
  PublicApplicationResponseSchema,
  parseApiResponse,
} from "@/contracts/clientApiSchemas";
import { enqueueUpload } from "@/lib/uploadQueue";
import { uploadDocument } from "@/services/documentService";
import { getPersistedAttribution } from "@/utils/attribution";

export async function submitApplication(
  payload: unknown,
  options?: { idempotencyKey?: string; continuationToken?: string }
): Promise<unknown> {
  const creditSessionToken = localStorage.getItem("creditSessionToken");
  const attribution = getPersistedAttribution();

  const submissionPayload =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? {
          ...(payload as Record<string, unknown>),
          ...attribution,
          ...(options?.continuationToken ? { continuationToken: options.continuationToken } : {}),
          creditSessionToken,
        }
      : payload;

  const res: unknown = await api.post("/api/client/submissions", submissionPayload, {
    headers: options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined,
  });
  localStorage.removeItem("creditSessionToken");
  return (res as { data?: unknown })?.data;
}

export async function createPublicApplication(
  payload: unknown,
  options?: { idempotencyKey?: string; readinessToken?: string; sessionId?: string }
): Promise<unknown> {
  const attribution = getPersistedAttribution();

  const submissionPayload =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? {
          ...(payload as Record<string, unknown>),
          ...attribution,
          readinessToken: options?.readinessToken,
          sessionId: options?.sessionId,
        }
      : payload;

  const res: unknown = await api.post("/api/applications", submissionPayload, {
    headers: {
      ...(options?.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options?.readinessToken ? { "X-Readiness-Token": options.readinessToken } : {}),
      ...(options?.sessionId ? { "X-Session-Id": options.sessionId } : {}),
    },
  });
  return parseApiResponse(
    PublicApplicationResponseSchema,
    (res as { data: unknown }).data,
    "POST /api/applications"
  );
}

export async function fetchApplication(id: string): Promise<unknown> {
  const res: unknown = await api.get(`/api/applications/${id}`);
  return parseApiResponse(
    FetchApplicationResponseSchema,
    (res as { data: unknown }).data,
    "GET /api/applications/{id}"
  );
}

export async function fetchApplicationDocuments(id: string): Promise<unknown> {
  const res: unknown = await api.get(`/api/applications/${id}/documents`);
  return parseApiResponse(
    ApplicationDocumentsResponseSchema,
    (res as { data: unknown }).data,
    "GET /api/applications/{id}/documents"
  );
}

export async function fetchApplicationOffers(id: string): Promise<unknown> {
  const res: unknown = await api.get(`/api/applications/${id}/offers`);
  return parseApiResponse(
    ApplicationOffersResponseSchema,
    (res as { data: unknown }).data,
    "GET /api/applications/{id}/offers"
  );
}

export async function uploadApplicationDocument(
  id: string,
  payload: {
    documentCategory: string;
    file: File;
    onProgress?: (progress: number) => void;
  }
): Promise<unknown> {
  if (payload.file.size > 10 * 1024 * 1024) {
    throw new Error("file_too_large");
  }

  const uploadUrl = `/api/applications/${id}/documents`;
  const formData = new FormData();
  formData.append("document_category", payload.documentCategory);
  formData.append("file", payload.file);

  if (!navigator.onLine) {
    await enqueueUpload({
      url: uploadUrl,
      formData,
    });
    return { queued: true };
  }

  payload.onProgress?.(10);
  const data = await uploadDocument(payload.file, id);
  payload.onProgress?.(100);
  return data as unknown;
}
