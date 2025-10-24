// Replace everything with a thin wrapper around the Staff API uploader.
import { uploadDocument } from "@/lib/api";

export async function uploadDocumentToStaff(appId: string, file: File, documentType: string) {
  return uploadDocument(appId, file, documentType as any);
}
export default uploadDocumentToStaff;