"use client";
import React, { useState } from "react";
import { useApplicationStore } from "../state/applicationStore";
import SignaturePad from "../components/SignaturePad";
import submitApplication from "../api/submitApplication";

export default function Step6() {
  const {
    businessInfo,
    applicantInfo,
    documents,
    productCategory,
    email,
    phone,
  } = useApplicationStore();

  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit() {
    setSubmitError("");

    if (!accepted) {
      setSubmitError("You must accept the terms.");
      return;
    }

    if (!signature) {
      setSubmitError("Signature required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        email,
        phone,
        productCategory,
        businessInfo,
        applicantInfo,
        documents,
        signature,
      };

      const response = await submitApplication(payload);

      if (!response.ok) throw new Error("Server rejected application.");
      window.location.href = "/portal";
    } catch (err: any) {
      setSubmitError(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Review & Sign</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Terms and Conditions</h2>
        <div className="border p-4 rounded bg-gray-50 text-sm h-48 overflow-y-scroll">
          <p>
            By submitting this application you certify that all information
            provided is true and complete and that you authorize Boreal Financial
            to verify all submitted information with third parties including
            lenders and service providers.
          </p>
        </div>
        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>I agree to the Terms and Conditions</span>
        </label>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Electronic Signature</h2>
        <SignaturePad onChange={setSignature} />
      </div>

      {submitError && (
        <div className="text-red-600 font-medium mb-4">{submitError}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
}
