import { api } from "./index";

export const applicationApi = {
  start: () => api.post("/application/start"),

  saveStep: (applicationId: string, step: number, data: any) =>
    api.post(`/application/${applicationId}/step`, { step, data }),

  fetchProducts: () => api.get("/lenders/products"),

  fetchRequiredDocuments: (productId: string) =>
    api.get(`/lenders/products/${productId}/documents`),

  submitApplication: (applicationId: string) =>
    api.post(`/application/${applicationId}/submit`),
};
