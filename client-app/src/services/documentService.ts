export async function uploadDocument(file: File, applicationId: string) {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("file_too_large");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("application_id", applicationId);

  const response = await fetch(`/documents/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("upload_failed");
  }

  return response.json();
}
