const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "File exceeds 25MB limit." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Unsupported file type." };
  }

  return { ok: true };
}
