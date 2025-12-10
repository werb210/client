import { api } from "./client";

export const ClientAppAPI = {
  start(payload: any) {
    return api.post("/api/client/app/start", payload);
  },
  update(token: string, payload: any) {
    return api.post(`/api/client/app/update/${token}`, payload);
  },
  uploadDoc(token: string, formData: FormData) {
    return api.post(`/api/client/app/upload-document/${token}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  submit(token: string) {
    return api.post(`/api/client/app/submit/${token}`);
  },
  status(token: string) {
    return api.get(`/api/client/app/status/${token}`);
  },
  getMessages(token: string) {
    return api.get(`/api/client/app/messages/${token}`);
  },
  sendMessage(token: string, text: string) {
    return api.post(`/api/client/app/messages/${token}`, { text });
  },
  getSignNowUrl(token: string) {
    return api.get(`/api/client/app/signnow/${token}`);
  }
};
