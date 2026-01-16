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
    return withRetry(() => api.post("/api/client/app/start", payload));
  },
  update(token: string, payload: any) {
    return withRetry(() => api.post(`/api/client/app/update/${token}`, payload));
  },
  uploadDoc(token: string, formData: FormData) {
    return withRetry(() =>
      api.post(`/api/client/app/upload-document/${token}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
  deferDocuments(token: string) {
    return withRetry(() =>
      api.post(`/api/client/app/defer-documents/${token}`)
    );
  },
  submit(token: string) {
    return withRetry(() => api.post(`/api/client/app/submit/${token}`));
  },
  status(token: string) {
    return withRetry(() => api.get(`/api/client/app/status/${token}`));
  },
  getMessages(token: string) {
    return withRetry(() => api.get(`/api/client/app/messages/${token}`));
  },
  sendMessage(token: string, text: string) {
    return withRetry(() => api.post(`/api/client/app/messages/${token}`, { text }));
  },
  getSignNowUrl(token: string) {
    return withRetry(() => api.get(`/api/client/app/signnow/${token}`));
  }
};
