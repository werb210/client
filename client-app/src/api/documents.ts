import { ClientDocumentMeta } from "@/utils/documentMetadata";

export async function uploadDocument(
  token: string | null,
  meta: ClientDocumentMeta,
  file: File
) {
  if (!token) throw new Error("Missing session token.");

  const form = new FormData();
  form.append("file", file);
  form.append("meta", JSON.stringify(meta));

  const res = await fetch(`${import.meta.env.VITE_API_URL}/client/upload-document`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Upload failed: " + text);
  }

  return await res.json();
}
