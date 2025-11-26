import { httpClient } from "./httpClient";

export const createApplication = async (formData: any) => {
  const res = await httpClient.post("/applications", formData);
  return res.data;
};

export const uploadDocument = async (appId: string, file: File, category: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const res = await httpClient.post(
    `/applications/${appId}/documents`,
    formData,
  );
  return res.data;
};

export const finalizeApplication = async (appId: string) => {
  const res = await httpClient.post(`/applications/${appId}/finalize`, {});
  return res.data;
};