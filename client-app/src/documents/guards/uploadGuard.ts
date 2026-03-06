export function validateUpload(file: File) {
  const allowed = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error("File exceeds 25MB limit");
  }

  return true;
}
