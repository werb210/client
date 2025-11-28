import { api } from "./index";

export async function fetchRequiredDocuments(category: string) {
  const res = await api.get("/public/lenders/products", {
    params: { category },
  });

  return res.data.requiredDocuments || [];
}

export async function uploadClientDocument({
  token,
  applicationId,
  docId,
  file,
  onProgress,
}: {
  token: string | null;
  applicationId: string;
  docId: string;
  file: File;
  onProgress?: (percent: number) => void;
}) {
  const form = new FormData();
  form.append("applicationId", applicationId);
  form.append("documentType", docId);
  form.append("file", file);

  const res = await api.post("/client/upload", form, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    },
  });

  return res.data;
}
