import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { useApplicationStore } from "../../state/applicationStore";

export default function SubmitApplication() {
  const navigate = useNavigate();
  const {
    email,
    phone,
    productCategory,
    businessInfo,
    applicantInfo,
    documents,
    clearApplication,
  } = useApplicationStore();

  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function uploadDocuments(applicationId: string) {
    const docs = documents || {};

    for (const [docId, file] of Object.entries(docs)) {
      if (!file) continue;

      const createUploadResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/public/applications/${applicationId}/documents/create-upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docId,
            fileName: file.name,
            mimeType: file.type,
          }),
        }
      );

      if (!createUploadResponse.ok) {
        throw new Error("Unable to start document upload.");
      }

      const { uploadUrl } = await createUploadResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Uploading a document failed.");
      }
    }
  }

  async function handleSubmit() {
    if (!agree) {
      alert("You must accept the terms to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        contact: { email, phone },
        productCategory,
        business: businessInfo,
        applicant: applicantInfo,
        documents: Object.keys(documents || {}),
        consentTimestamp: new Date().toISOString(),
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/public/applications/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Submission failed. Please try again.");
      }

      const data = await res.json();
      const applicationId = data.applicationId;

      if (!applicationId) {
        throw new Error("Missing application ID from server response.");
      }

      await uploadDocuments(applicationId);

      clearApplication();

      navigate(`/portal?applicationId=${applicationId}`);
    } catch (err) {
      console.error(err);
      alert("❌ Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  const applicantFullName = `${applicantInfo.firstName} ${applicantInfo.lastName}`.trim();

  return (
    <PageContainer title="Review & Submit">
      {/* ------------------- TERMS ------------------- */}
      <h2 className="mb-2 text-lg font-semibold">Terms & Conditions</h2>
      <div className="mb-4 max-h-60 overflow-y-auto rounded border bg-gray-50 p-4 text-sm text-gray-700">
        <p>
          By submitting this application you confirm that all information provided is true
          and accurate. You authorize Boreal Financial and its lending partners to review
          your application and supporting documents.
        </p>

        <p className="mt-2">Electronic consent is legally binding.</p>
      </div>

      <label className="mb-6 flex items-center">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mr-2"
        />
        <span>I agree to the terms and conditions.</span>
      </label>

      {/* ------------------- REVIEW ------------------- */}
      <h2 className="mb-2 text-lg font-semibold">Review Your Information</h2>

      <div className="mb-4 rounded border p-4">
        <h3 className="font-semibold">Business Information</h3>
        <p>{businessInfo.businessName || "Not provided"}</p>
        <p>{businessInfo.businessAddress || ""}</p>
        <p>
          {businessInfo.businessCity}
          {businessInfo.businessProvince ? `, ${businessInfo.businessProvince}` : ""}
          {businessInfo.businessPostalCode ? ` ${businessInfo.businessPostalCode}` : ""}
        </p>
        <p>Years in business: {businessInfo.yearsInBusiness || "Not provided"}</p>
        <p>Industry: {businessInfo.industry || "Not provided"}</p>
        <p>Monthly Revenue: {businessInfo.monthlyRevenue || "Not provided"}</p>
      </div>

      <div className="mb-4 rounded border p-4">
        <h3 className="font-semibold">Applicant Information</h3>
        <p>{applicantFullName || "Not provided"}</p>
        <p>{applicantInfo.email}</p>
        <p>{applicantInfo.phone}</p>
        {applicantInfo.hasBusinessPartner && (
          <div className="mt-2 space-y-1">
            <p className="font-medium">Partner</p>
            <p>
              {[applicantInfo.partnerFirstName, applicantInfo.partnerLastName]
                .filter(Boolean)
                .join(" ") || "Not provided"}
            </p>
            {applicantInfo.partnerEmail && <p>{applicantInfo.partnerEmail}</p>}
            {applicantInfo.partnerPhone && <p>{applicantInfo.partnerPhone}</p>}
          </div>
        )}
      </div>

      <div className="mb-4 rounded border p-4">
        <h3 className="font-semibold">Selected Product</h3>
        <p>{productCategory || "Not selected"}</p>
      </div>

      <div className="mb-6 rounded border p-4">
        <h3 className="font-semibold">Documents</h3>
        {Object.keys(documents || {}).length > 0 ? (
          <ul className="list-disc pl-5">
            {Object.entries(documents).map(([id, file]) => (
              <li key={id}>
                {id}: {file ? file.name : "Upload Later"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">No documents added.</p>
        )}
      </div>

      {/* ------------------- SUBMIT ------------------- */}
      <Button
        disabled={submitting}
        onClick={handleSubmit}
        className="w-full"
        variant="primary"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </Button>
    </PageContainer>
  );
}
