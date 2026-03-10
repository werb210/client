export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
];

export function validateFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds 25MB limit");
  }
}
