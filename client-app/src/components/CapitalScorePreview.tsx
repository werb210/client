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

  async function handleSubmit() {
    trackEvent("capital_score_requested");

    try {
      await submitCreditReadiness(formState);
      alert("A Boreal Intake Specialist will contact you shortly.");
      window.location.href = "/";
    } catch {
      alert("Submission failed. Please try again.");
    }
  }

  return (
    <div>
      <button onClick={() => void handleSubmit()}>Preview Your Capital Readiness</button>
    </div>
  );
}
