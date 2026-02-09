import { isApplicationSubmitted } from "../services/resume";
import { normalizeSubmissionStatus } from "../services/applicationStatus";

type SubmissionStatusLike = {
  status?: string | null;
};

export function getPipelineStage(
  status: any,
  submission?: SubmissionStatusLike | null
) {
  const documents = status?.documents || status?.application?.documents;
  const hasRejectedDocuments =
    Array.isArray(documents)
      ? documents.some((doc) => doc?.status === "rejected")
      : documents &&
        Object.values(documents).some((doc: any) => doc?.status === "rejected");
  if (hasRejectedDocuments) return "Requires Documents";

  const rawSubmissionStatus =
    submission?.status ??
    status?.submission_status ??
    status?.submissionStatus ??
    status?.submission?.status ??
    "";
  const submissionStatus = normalizeSubmissionStatus(rawSubmissionStatus);

  const raw =
    status?.status ||
    status?.stage ||
    status?.pipelineStatus ||
    status?.state ||
    "";
  const normalized = String(raw).toLowerCase();

  if (normalized.includes("declined") || normalized.includes("rejected")) {
    return "Accepted / Declined";
  }
  if (normalized.includes("offer")) {
    return "Offer Available";
  }
  if (normalized.includes("accept") || normalized.includes("approved")) {
    return "Accepted / Declined";
  }
  if (submissionStatus === "submitted" || normalized.includes("lender")) {
    return "Sent to Lender";
  }
  if (normalized.includes("credit")) return "Credit Summary Created";
  if (normalized.includes("review") || normalized.includes("document")) {
    return "Documents Under Review";
  }
  if (isApplicationSubmitted(status)) {
    return "Application Submitted";
  }
  return "Application Submitted";
}
