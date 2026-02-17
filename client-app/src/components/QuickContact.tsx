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
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4" role="status" aria-live="polite">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-gray-900 shadow-xl">
            <p className="mb-4 text-base font-semibold">A Boreal Intake Specialist will contact you shortly</p>
            <button
              type="button"
              className="rounded bg-[#0a2540] px-6 py-3 text-white"
              onClick={() => {
                setSuccess(false);
                window.location.href = "/";
              }}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
      {error ? (
        <div role="alert" aria-live="assertive">
          {error}
        </div>
      ) : null}
      <label htmlFor="quick-contact-company">Company</label>
      <input
        id="quick-contact-company"
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
      />
      <label htmlFor="quick-contact-full-name">Full Name</label>
      <input
        id="quick-contact-full-name"
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <label htmlFor="quick-contact-email">Email</label>
      <input
        id="quick-contact-email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <label htmlFor="quick-contact-phone">Phone</label>
      <input
        id="quick-contact-phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <label htmlFor="quick-contact-message">Message</label>
      <input
        id="quick-contact-message"
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      <button onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
