export type DocumentStatus = "missing" | "uploaded" | "accepted" | "rejected";

export function resolveDocumentStatus(entry: any): DocumentStatus {
  if (!entry) return "missing";
  if (entry.status === "accepted") return "accepted";
  if (entry.status === "rejected") return "rejected";
  return "uploaded";
}

export function getRejectionMessage(entry: any) {
  if (!entry || entry.status !== "rejected") return "";
  const reason =
    entry.rejection_reason || entry.rejectionReason || entry.reason || "";
  if (reason) {
    return `Document rejected. Reason: ${reason}. Please upload a new file.`;
  }
  return "Document rejected. Please upload a new file.";
}
