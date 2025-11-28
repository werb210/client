import axios from "axios";
import { API_BASE_URL } from "./config";

export async function fetchRequiredDocuments(category: string) {
  const res = await axios.get(`${API_BASE_URL}/public/lenders/products`, {
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

  const res = await axios.post(`${API_BASE_URL}/client/upload`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        const percent = Math.round((evt.loaded * 100) / evt.total);
        onProgress(percent);
      }
    },
  });

  return res.data;
}
