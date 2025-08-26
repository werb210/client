export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploading" | "completed" | "error";
  documentType: string;
  preview?: string;
  uploadProgress?: number;
  uploadedAt?: string;
}