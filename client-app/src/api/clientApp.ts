import { api } from "./client";

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
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
  start(payload: any) {
    return withRetry(() => api.post("/api/applications", payload));
  },
  update(token: string, payload: any) {
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
    return withRetry(() => api.get(`/api/applications/${token}`));
  },
  getMessages(token: string) {
    return withRetry(() => api.get(`/api/applications/${token}/messages`));
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
