import api from "@/lib/api";
import {
  ClientAppMessagesResponseSchema,
  ClientAppStartResponseSchema,
  ClientAppStatusResponseSchema,
  parseApiResponse,
} from "@/contracts/clientApiSchemas";
import type { ApiError, ApiResponse } from "@/types/api";

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const apiError = err as ApiError;
      const status = apiError.response?.status;
      const retriable = !status || [429, 500, 502, 503, 504].includes(status);
      if (!retriable || i === attempts - 1) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, 500 * (i + 1)));
    }
  }
  throw lastError;
}

export const ClientAppAPI = {
  start(payload: unknown) {
    return withRetry(async () => {
      const res: ApiResponse<unknown> = await api.post("/api/applications", payload);
      parseApiResponse(
        ClientAppStartResponseSchema,
        res.data,
        "POST /api/applications"
      );
      return res;
    });
  },
  update(token: string, payload: unknown) {
    return withRetry(() => api.patch(`/api/applications/${token}`, payload));
  },
  uploadDoc(
    token: string,
    payload: {
      documents: Record<
        string,
        { name: string; base64: string; productId?: string; documentCategory?: string }
      >;
    }
  ) {
    return withRetry(() =>
      api.patch(`/api/applications/${token}`, payload)
    );
  },
  deferDocuments(token: string) {
    return withRetry(() =>
      api.patch(`/api/applications/${token}`, { documentsDeferred: true })
    );
  },
  submit(token: string) {
    return withRetry(() => api.post(`/api/applications/${token}/submit`));
  },
  status(token: string) {
    return withRetry(async () => {
      const res: ApiResponse<unknown> = await api.get(`/api/applications/${token}`);
      parseApiResponse(
        ClientAppStatusResponseSchema,
        res.data,
        "GET /api/applications/{token}"
      );
      return res;
    });
  },
  getApplication(applicationId: string) {
    return withRetry(async () => {
      const res: ApiResponse<unknown> = await api.get(`/api/applications/${applicationId}`);
      parseApiResponse(
        ClientAppStatusResponseSchema,
        res.data,
        "GET /api/applications/{applicationId}"
      );
      return res;
    });
  },
  updateApplication(applicationId: string, payload: unknown) {
    return withRetry(() => api.patch(`/api/applications/${applicationId}`, payload));
  },
  getMessages(token: string) {
    return withRetry(async () => {
      const res: ApiResponse<unknown> = await api.get(`/api/applications/${token}/messages`);
      parseApiResponse(
        ClientAppMessagesResponseSchema,
        res.data,
        "GET /api/applications/{token}/messages"
      );
      return res;
    });
  },
  sendMessage(token: string, text: string) {
    return withRetry(() =>
      api.post(`/api/applications/${token}/messages`, { text })
    );
  },
  getSignNowUrl(token: string) {
    return withRetry(() => api.get(`/api/applications/${token}/signnow`));
  },
};
