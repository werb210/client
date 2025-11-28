import { api } from "./index";

export const documentsApi = {
  upload: (applicationId: string, docType: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);

    return api.post(`/application/${applicationId}/uploadDocument`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  listUploaded: (applicationId: string) =>
    api.get(`/application/${applicationId}/uploaded-documents`),
};
