import axios from "axios";

// Use your staff backend API base URL
const API_BASE = import.meta.env.VITE_STAFF_API_URL;

export const createApplication = async (formData: any) => {
  const res = await axios.post(`${API_BASE}/api/applications`, formData, {
    withCredentials: true,
  });
  return res.data;
};

export const uploadDocument = async (appId: string, file: File, category: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await axios.post(`${API_BASE}/api/applications/${appId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
  return res.data;
};

export const finalizeApplication = async (appId: string) => {
  const res = await axios.post(`${API_BASE}/api/applications/${appId}/finalize`, {}, {
    withCredentials: true,
  });
  return res.data;
};