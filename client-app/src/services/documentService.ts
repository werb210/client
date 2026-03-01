export async function uploadDocument(file: File, applicationId: string) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("file_too_large");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/applications/${applicationId}/documents`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("upload_failed");
  }

  return response.json();
}
