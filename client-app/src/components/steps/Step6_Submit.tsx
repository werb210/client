import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import TERMS_TEXT from "@/content/terms";

interface Step6Props {
  data: any;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step6_Submit({ data, onBack, onSubmit }: Step6Props) {
  const [agree, setAgree] = useState(false);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFinalSubmit() {
    if (!agree) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }
    if (!signature.trim()) {
      setError("Please type your full name to sign.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_STAFF_SERVER}/api/client/submit-application`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            signature,
            signatureTimestamp: new Date().toISOString()
          })
        }
      );

      if (!resp.ok) throw new Error("Submission failed");

      onSubmit();
    } catch (err) {
      setError("There was a problem submitting your application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 p-6">
      <h2 className="text-2xl font-semibold text-gray-900">
        Review & Submit Application
      </h2>

      {/* Terms */}
      <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {TERMS_TEXT}
        </pre>
      </div>

      {/* Agree */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={() => setAgree(!agree)}
          className="mt-1"
        />
        <div className="text-sm text-gray-800">
          I agree to the Terms & Conditions.
        </div>
      </label>

      {/* Review Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-gray-900">Review Your Details</h3>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div>
            <strong>Business Name:</strong> {data.business?.name}
          </div>
          <div>
            <strong>Applicant Name:</strong> {data.applicant?.firstName}{" "}
            {data.applicant?.lastName}
          </div>
          <div>
            <strong>Email:</strong> {data.applicant?.email}
          </div>
          <div>
            <strong>Phone:</strong> {data.applicant?.phone}
          </div>
          <div>
            <strong>Selected Product:</strong> {data.product?.name}
          </div>
          <div>
            <strong>Documents Uploaded:</strong>{" "}
            {Object.values(data.documents || {}).filter(Boolean).length}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-3">
          This is a summary. Staff will review all details and documents.
        </div>
      </div>

      {/* Signature */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-900">
          Type Your Full Name to Sign
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="John Doe"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>

        <Button variant="primary" onClick={handleFinalSubmit} disabled={loading}>
          {loading ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
