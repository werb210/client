import { api } from "./index";

export const portalApi = {
  fetchApplication: (applicationId: string) =>
    api.get(`/application/${applicationId}`),

  fetchRequiredDocuments: (applicationId: string) =>
    api.get(`/application/${applicationId}/required-documents`),

  fetchStatusTimeline: (applicationId: string) =>
    api.get(`/application/${applicationId}/status-timeline`),

  fetchMessages: (applicationId: string) =>
    api.get(`/application/${applicationId}/messages`),

  sendMessage: (applicationId: string, text: string) =>
    api.post(`/application/${applicationId}/messages`, { text }),

  assistantChat: (applicationId: string, text: string) =>
    api.post(`/application/${applicationId}/assistant`, { text }),
};
