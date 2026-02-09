import { api } from "./client";

export async function submitApplication(payload: unknown) {
  const res = await api.post("/api/client/submissions", payload);
  return res.data;
}

export async function createPublicApplication(payload: unknown) {
  const res = await api.post("/api/applications", payload);
  return res.data;
}

export async function fetchApplication(id: string) {
  const res = await api.get(`/api/applications/${id}`);
  return res.data;
}

export async function fetchApplicationDocuments(id: string) {
  const res = await api.get(`/api/applications/${id}/documents`);
  return res.data;
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
