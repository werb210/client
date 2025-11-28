import axios from "axios";
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

export async function apiUpdateApplicationDraft({
  applicationId,
  payload,
  token,
}: {
  applicationId: string | null;
  payload: Record<string, any>;
  token: string | null;
}) {
  return axios.post(
    `${import.meta.env.VITE_API_URL}/client/application/draft`,
    {
      applicationId,
      data: payload,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function apiGetApplicationDraft(token: string | null) {
  if (!token) return null;

  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/client/application/draft`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
}
