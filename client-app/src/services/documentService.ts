import { validateFile } from "@/utils/fileValidation";
import { apiRequest } from "@/api/client";

export async function uploadDocument(file: File, applicationId: string) {
  validateFile(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("application_id", applicationId);

  return apiRequest(`/documents/upload`, {
    method: "POST",
    body: formData,
    headers: {},
  });
}
