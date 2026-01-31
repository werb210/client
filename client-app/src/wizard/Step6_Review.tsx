import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import { submitApplication } from "../api/applications";
import {
  buildSubmissionPayload,
  getMissingRequiredDocs,
} from "./submission";
import { ClientProfileStore } from "../state/clientProfiles";

export function Step6_Review() {
  const { app, update } = useApplicationStore();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>(
    {}
  );
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const navigate = useNavigate();
  const hasPartner = Boolean(app.applicant?.hasMultipleOwners);
  const idRequirements = useMemo(
    () => [
      {
        key: "primary_applicant_id",
        label: "Primary applicant photo ID",
        required: true,
      },
      {
        key: "partner_applicant_id",
        label: "Business partner photo ID",
        required: hasPartner,
      },
    ],
    [hasPartner]
  );
  const missingIdDocs = useMemo(
    () =>
      idRequirements
        .filter((entry) => entry.required)
        .filter((entry) => !app.documents[entry.key])
        .map((entry) => entry.key),
    [app.documents, idRequirements]
  );

  useEffect(() => {
    if (app.currentStep !== 6) {
      update({ currentStep: 6 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (!app.signatureDate) {
      update({ signatureDate: today });
    }
  }, [app.signatureDate, today, update]);

  function toggleTerms() {
    update({ termsAccepted: !app.termsAccepted });
  }

  async function submit() {
    setSubmitError(null);

    if (!app.applicationToken) {
      setSubmitError("Missing application token. Please restart your application.");
      return;
    }

    if (!app.selectedProductId) {
      setSubmitError("Missing product selection. Please return to Step 2.");
      return;
    }

    const missingRequiredDocs = getMissingRequiredDocs(app);
    if (!app.documentsDeferred && missingRequiredDocs.length > 0) {
      setSubmitError("Please upload all required documents before submitting.");
      return;
    }

    if (!app.typedSignature?.trim()) {
      alert("Please type your full name to sign.");
      return;
    }

    if (hasPartner && !app.coApplicantSignature?.trim()) {
      alert("Please enter a signature for each applicant.");
      return;
    }

    if (missingIdDocs.length > 0) {
      setSubmitError("Please upload all required applicant IDs before submitting.");
      return;
    }

    if (!app.termsAccepted) {
      alert("You must accept the Terms & Conditions.");
      return;
    }

    try {
      await ClientAppAPI.update(app.applicationToken, {
        financialProfile: app.kyc,
        selectedProduct: app.selectedProduct,
        selectedProductId: app.selectedProductId,
        selectedProductType: app.selectedProductType,
        requires_closing_cost_funding: app.requires_closing_cost_funding,
        business: app.business,
        applicant: app.applicant,
        documents: app.documents,
        documentsDeferred: app.documentsDeferred,
        termsAccepted: app.termsAccepted,
        typedSignature: app.typedSignature,
        coApplicantSignature: app.coApplicantSignature,
        signatureDate: app.signatureDate || today,
        currentStep: app.currentStep,
      });
      const payload = buildSubmissionPayload(app);
      await submitApplication(payload);
      if (app.kyc?.phone && app.applicationToken) {
        ClientProfileStore.markSubmitted(app.kyc.phone, app.applicationToken);
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(
        "We couldn't submit your application. Please try again or contact support."
      );
    }
  }

  if (submitError) {
    return (
      <WizardLayout>
        <Card
          className="space-y-3"
          style={{ textAlign: "center", padding: theme.spacing.xl }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: theme.colors.textSecondary,
            }}
          >
            Submission error
          </div>
          <h1
            style={{
              fontSize: theme.typography.h1.fontSize,
              fontWeight: theme.typography.h1.fontWeight,
              color: theme.colors.textPrimary,
              margin: 0,
            }}
          >
            We couldn’t submit your application
          </h1>
          <p style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
            {submitError}
          </p>
          <Button
            style={{ marginTop: theme.spacing.sm, width: "100%", maxWidth: "260px" }}
            onClick={() => setSubmitError(null)}
          >
            Return to review
          </Button>
        </Card>
      </WizardLayout>
    );
  }

  if (submitted) {
    return (
      <WizardLayout>
        <Card
          className="space-y-3"
          style={{ textAlign: "center", padding: theme.spacing.xl }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: theme.colors.textSecondary,
            }}
          >
            Application submitted
          </div>
          <h1
            style={{
              fontSize: theme.typography.h1.fontSize,
              fontWeight: theme.typography.h1.fontWeight,
              color: theme.colors.textPrimary,
              margin: 0,
            }}
          >
            Thank you for your submission.
          </h1>
          <p style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
            We’ve received your application and will notify you about next
            steps. You can also review updates in your client portal.
          </p>
          <Button
            style={{ marginTop: theme.spacing.sm, width: "100%", maxWidth: "260px" }}
            onClick={() =>
              (window.location.href = "/portal")
            }
          >
            View application status
          </Button>
        </Card>
      </WizardLayout>
    );
  }

  async function handleIdUpload(docType: string, file: File | null) {
    if (!file || !app.applicationToken) return;

    setDocErrors((prev) => ({ ...prev, [docType]: "" }));

    if (file.size > 15 * 1024 * 1024) {
      setDocErrors((prev) => ({
        ...prev,
        [docType]: "File too large. Max 15 MB.",
      }));
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileType = file.type || "";
    const extension = file.name.toLowerCase();
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
    const validType =
      allowedTypes.includes(fileType) ||
      allowedExtensions.some((ext) => extension.endsWith(ext));

    if (!validType) {
      setDocErrors((prev) => ({
        ...prev,
        [docType]: "Unsupported file type. Allowed: PDF, PNG, JPEG, DOCX.",
      }));
      return;
    }

    try {
      setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.onload = () => {
          const result = String(reader.result || "");
          const payload = result.includes(",") ? result.split(",")[1] : result;
          resolve(payload);
        };
        reader.readAsDataURL(file);
      });
      await ClientAppAPI.uploadDoc(app.applicationToken, {
        documents: {
          [docType]: {
            name: file.name,
            base64,
            productId: app.selectedProductId,
            documentCategory: docType,
          },
        },
      });
      update({
        documents: {
          ...app.documents,
          [docType]: {
            name: file.name,
            base64,
            category: docType,
            productId: app.selectedProductId,
            status: "uploaded",
          },
        },
      });
      setDocErrors((prev) => ({ ...prev, [docType]: "" }));
    } catch (error) {
      console.error("ID upload failed:", error);
      setDocErrors((prev) => ({
        ...prev,
        [docType]: "ID upload failed. Please try again.",
      }));
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
  }

  return (
    <WizardLayout>
      <StepHeader step={6} title="Terms & Typed Signature" />

      <Card className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-3">
            <h2
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                marginBottom: theme.spacing.xs,
                color: theme.colors.textPrimary,
              }}
            >
              Applicant IDs
            </h2>
            {idRequirements
              .filter((entry) => entry.required)
              .map((entry) => {
                const docError = docErrors[entry.key];
                const isUploading = uploadingDocs[entry.key];
                const docStatus = app.documents[entry.key]?.status;
                return (
                  <div
                    key={entry.key}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-borealBlue">
                        {entry.label}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {isUploading ? "Uploading" : docStatus || "missing"}
                      </span>
                    </div>
                    <input
                      id={`id-doc-${entry.key}`}
                      type="file"
                      className="hidden"
                      onChange={(e: any) =>
                        handleIdUpload(entry.key, e.target.files?.[0] || null)
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isUploading}
                      onClick={() =>
                        document.getElementById(`id-doc-${entry.key}`)?.click()
                      }
                      style={{ width: "100%" }}
                    >
                      {isUploading ? "Uploading..." : "Upload ID"}
                    </Button>
                    {app.documents[entry.key] && (
                      <div className="text-xs text-slate-500">
                        Uploaded: {app.documents[entry.key].name}
                      </div>
                    )}
                    {docError && (
                      <div className="text-xs text-red-600">{docError}</div>
                    )}
                    {!docError && !app.documents[entry.key] && (
                      <div className="text-xs text-red-600">
                        This ID is required.
                      </div>
                    )}
                    {docStatus === "rejected" && (
                      <div className="text-xs text-red-600">
                        ID rejected. Please upload a new file.
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="md:col-span-2">
            <h2
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                marginBottom: theme.spacing.xs,
                color: theme.colors.textPrimary,
              }}
            >
              Terms & Conditions
            </h2>
            <div
              style={{
                background: theme.colors.background,
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.layout.radius,
                fontSize: "14px",
                color: theme.colors.textSecondary,
                whiteSpace: "pre-line",
              }}
            >
              {TERMS_TEXT}
            </div>
          </div>

          <div className="space-y-2">
            <label
              style={{
                display: "block",
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.textSecondary,
              }}
            >
              Typed signature
            </label>
            <Input
              placeholder="Type your full legal name"
              value={app.typedSignature || ""}
              onChange={(e: any) => update({ typedSignature: e.target.value })}
            />
            <p style={{ fontSize: "12px", color: theme.colors.textSecondary }}>
              By typing your name, you are providing a legally binding signature.
            </p>
          </div>

          {hasPartner && (
            <div className="space-y-2">
              <label
                style={{
                  display: "block",
                  fontSize: theme.typography.label.fontSize,
                  fontWeight: theme.typography.label.fontWeight,
                  color: theme.colors.textSecondary,
                }}
              >
                Business partner signature
              </label>
              <Input
                placeholder="Type full legal name"
                value={app.coApplicantSignature || ""}
                onChange={(e: any) =>
                  update({ coApplicantSignature: e.target.value })
                }
              />
              <p style={{ fontSize: "12px", color: theme.colors.textSecondary }}>
                All applicants listed in the application must sign.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label
              style={{
                display: "block",
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.textSecondary,
              }}
            >
              Date
            </label>
            <Input value={app.signatureDate || today} readOnly />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.spacing.xs,
              fontSize: theme.typography.label.fontSize,
              fontWeight: theme.typography.label.fontWeight,
              color: theme.colors.textPrimary,
            }}
            className="md:col-span-2"
          >
            <input
              type="checkbox"
              checked={app.termsAccepted}
              onChange={toggleTerms}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                border: `1px solid ${theme.colors.border}`,
                background: app.termsAccepted ? theme.colors.primary : theme.colors.surface,
                display: "inline-grid",
                placeContent: "center",
                appearance: "none",
                marginTop: "2px",
                backgroundImage: app.termsAccepted
                  ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 10.5l3 3 7-7' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"
                  : "none",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "12px",
              }}
            />
            <span>I agree to the Terms & Conditions</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            style={{ width: "100%", maxWidth: "160px" }}
            onClick={() => navigate("/apply/step-5")}
          >
            ← Back
          </Button>
          <Button
            style={{
              width: "100%",
              maxWidth: "240px",
            }}
            onClick={submit}
            disabled={
              !app.termsAccepted ||
              !app.typedSignature?.trim() ||
              (hasPartner && !app.coApplicantSignature?.trim()) ||
              missingIdDocs.length > 0
            }
          >
            Submit application
          </Button>
        </div>
      </Card>
    </WizardLayout>
  );
}

export default Step6_Review;
