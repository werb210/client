import { useState } from "react";
import { submitContactForm } from "@/api/website";

export default function QuickContact() {
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      await submitContactForm(form);
      setSuccess(true);
    } catch (submitError: any) {
      setError(submitError?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {success ? (
        <div role="status" aria-live="polite">
          A Boreal Intake Specialist will contact you shortly.
        </div>
      ) : null}
      {error ? (
        <div role="alert" aria-live="assertive">
          {error}
        </div>
      ) : null}
      <input
        placeholder="Company"
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
      />
      <input
        placeholder="Full Name"
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        placeholder="Message"
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
