export type SubmissionBanner = {
  title: string;
  message: string;
  cta?: string;
};

export const SUBMISSION_SENT_BANNER: SubmissionBanner = {
  title: "Application sent to lender",
  message: "We sent your application to a lender. You'll receive SMS and email updates.",
};

export const SUBMISSION_REQUIRES_DOCS_BANNER: SubmissionBanner = {
  title: "Documents required",
  message: "We need additional documents to continue. Check your SMS and email for details.",
};

export const SUBMISSION_FAILURE_BANNER: SubmissionBanner = {
  title: "Application delayed",
  message:
    "We're still working on sending your application. Message your intake specialist for help.",
  cta: "Message your intake specialist",
};

export function getSubmissionStageBanner(stage: string) {
  if (stage === "Sent to Lender") return SUBMISSION_SENT_BANNER;
  if (stage === "Requires Documents") return SUBMISSION_REQUIRES_DOCS_BANNER;
  return null;
}

export function getSubmissionFailureBanner(_rawStatus?: string) {
  return SUBMISSION_FAILURE_BANNER;
}
