import crypto from "crypto";

export interface ClientDocumentMeta {
  id: string;                       // local temp id
  category: string;                 // e.g., "bank_statements", "void_cheque"
  fileName: string;
  fileType: string;
  sizeBytes: number;
  sha256: string;
  uploadedAt: string;
}

/**
 * createDocumentMeta
 * -------------------
 * Generates a complete metadata object for the document
 * BEFORE it is uploaded to the Staff Server.
 */
export async function createDocumentMeta(
  file: File,
  category: string
): Promise<ClientDocumentMeta> {
  const buffer = await file.arrayBuffer();
  const hash = crypto
    .createHash("sha256")
    .update(Buffer.from(buffer))
    .digest("hex");

  return {
    id: crypto.randomUUID(),
    category,
    fileName: file.name,
    fileType: file.type,
    sizeBytes: file.size,
    sha256: hash,
    uploadedAt: new Date().toISOString(),
  };
}
