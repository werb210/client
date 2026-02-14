import { useState } from "react";
import { submitCreditReadiness, type CreditReadinessPayload } from "@/api/website";
import { trackEvent } from "../utils/analytics";

export default function CapitalScorePreview() {
  const [formState] = useState<CreditReadinessPayload>({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;

    trackEvent("capital_score_requested");
    setSubmitting(true);

    try {
      await submitCreditReadiness(formState);
      alert("A Boreal Intake Specialist will contact you shortly.");
      window.location.href = "/";
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? "Submitting..." : "Preview Your Capital Readiness"}
      </button>
    </div>
  );
}
