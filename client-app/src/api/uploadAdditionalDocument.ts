const STAFF_SERVER_URL =
  import.meta.env.VITE_STAFF_SERVER_URL || process.env.NEXT_PUBLIC_STAFF_SERVER_URL;

export default async function uploadAdditionalDocument(
  email: string,
  token: string,
  docType: string,
  file: File
) {
  if (!STAFF_SERVER_URL) throw new Error("Staff server URL not configured");

  const form = new FormData();
  form.append("email", email);
  form.append("token", token);
  form.append("documentType", docType);
  form.append("file", file);

  const r = await fetch(`${STAFF_SERVER_URL}/api/client/upload-doc`, {
    method: "POST",
    body: form
  });

  if (!r.ok) throw new Error("Upload failed");
  return r.json();
}
