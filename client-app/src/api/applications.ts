import { api } from "./client";
import {
  ApplicationDocumentsResponseSchema,
  ApplicationOffersResponseSchema,
  FetchApplicationResponseSchema,
  PublicApplicationResponseSchema,
  parseApiResponse,
} from "@/contracts/clientApiSchemas";

export async function submitApplication(
  payload: unknown,
  options?: { idempotencyKey?: string; continuationToken?: string }
) {
  const creditSessionToken = localStorage.getItem("creditSessionToken");

  const submissionPayload =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? {
          ...(payload as Record<string, unknown>),
          ...(options?.continuationToken ? { continuationToken: options.continuationToken } : {}),
          creditSessionToken,
        }
      : payload;

  const res = await api.post("/api/client/submissions", submissionPayload, {
    headers: options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined,
  });
  localStorage.removeItem("creditSessionToken");
  return res.data;
}

export async function createPublicApplication(
  payload: unknown,
  options?: { idempotencyKey?: string; readinessToken?: string; sessionId?: string }
) {
  const submissionPayload =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? {
          ...(payload as Record<string, unknown>),
          readinessToken: options?.readinessToken,
          sessionId: options?.sessionId,
        }
      : payload;

  const res = await api.post("/api/applications", submissionPayload, {
    headers: {
      ...(options?.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options?.readinessToken ? { "X-Readiness-Token": options.readinessToken } : {}),
      ...(options?.sessionId ? { "X-Session-Id": options.sessionId } : {}),
    },
  });
  return parseApiResponse(
    PublicApplicationResponseSchema,
    res.data,
    "POST /api/applications"
  );
}

export async function fetchApplication(id: string) {
  const res = await api.get(`/api/applications/${id}`);
  return parseApiResponse(
    FetchApplicationResponseSchema,
    res.data,
    "GET /api/applications/{id}"
  );
}

export async function fetchApplicationDocuments(id: string) {
  const res = await api.get(`/api/applications/${id}/documents`);
  return parseApiResponse(
    ApplicationDocumentsResponseSchema,
    res.data,
    "GET /api/applications/{id}/documents"
  );
}

export async function fetchApplicationOffers(id: string) {
  const res = await api.get(`/api/applications/${id}/offers`);
  return parseApiResponse(
    ApplicationOffersResponseSchema,
    res.data,
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
) {
  const formData = new FormData();
  formData.append("document_category", payload.documentCategory);
  formData.append("file", payload.file);

  const res = await api.post(`/api/applications/${id}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!payload.onProgress || !event.total) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      payload.onProgress(progress);
    },
  });
  return res.data;
}
