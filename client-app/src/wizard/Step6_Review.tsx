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
import { submitApplication } from "../api/applications";
import {
  buildSubmissionPayload,
  getMissingRequiredDocs,
  shouldBlockForMissingDocuments,
} from "./submission";
import { ClientProfileStore } from "../state/clientProfiles";
import { FileUploadCard } from "../components/FileUploadCard";
import { Checkbox } from "../components/ui/Checkbox";
import { extractApplicationFromStatus } from "../applications/resume";
import { filterRequirementsByAmount, type LenderProductRequirement } from "./requirements";
import { components, layout, tokens } from "@/styles";
import { resolveStepGuard } from "./stepGuard";

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
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const hasPartner = Boolean(app.applicant?.hasMultipleOwners);
  const requirementsKey = useMemo(
    () => (app.productRequirements?.aggregated ? "aggregated" : app.selectedProductId),
    [app.productRequirements, app.selectedProductId]
  );
  const requiredDocTypes = useMemo(() => {
    if (!requirementsKey) return [];
    const requirements =
      (app.productRequirements?.[requirementsKey] || []) as LenderProductRequirement[];
    return filterRequirementsByAmount(requirements, app.kyc?.fundingAmount)
      .filter((entry) => entry.required)
      .map((entry) => entry.document_type);
  }, [app.kyc?.fundingAmount, app.productRequirements, requirementsKey]);
  const missingRequiredDocs = useMemo(() => getMissingRequiredDocs(app), [app]);
  const docsAccepted = useMemo(() => {
    if (app.documentsDeferred) return true;
    if (requiredDocTypes.length === 0) return true;
    return requiredDocTypes.every(
      (docType) => app.documents[docType]?.status === "accepted"
    );
  }, [app.documents, app.documentsDeferred, requiredDocTypes]);
  const processingComplete = useMemo(() => {
    if (app.documentsDeferred) return true;
    return Boolean(app.ocrComplete && app.creditSummaryComplete);
  }, [app.creditSummaryComplete, app.documentsDeferred, app.ocrComplete]);
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
        .filter((entry) => {
          const doc = app.documents[entry.key];
          if (!doc) return true;
          return doc.status === "rejected";
        })
        .map((entry) => entry.key),
    [app.documents, idRequirements]
  );

  useEffect(() => {
    if (app.currentStep !== 6) {
      update({ currentStep: 6 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    const guard = resolveStepGuard(app.currentStep, 6);
    if (!guard.allowed) {
      navigate(`/apply/step-${guard.redirectStep}`, { replace: true });
    }
  }, [app.currentStep, navigate]);

  useEffect(() => {
    if (!app.signatureDate) {
      update({ signatureDate: today });
    }
  }, [app.signatureDate, today, update]);

  useEffect(() => {
    if (!app.applicationToken) return;
    ClientAppAPI.status(app.applicationToken)
      .then((res) => {
        const refreshed = extractApplicationFromStatus(
          res?.data || {},
          app.applicationToken
        );
        update({
          documents: refreshed.documents || app.documents,
          documentsDeferred:
            typeof refreshed.documentsDeferred === "boolean"
              ? refreshed.documentsDeferred
              : app.documentsDeferred,
          ocrComplete: refreshed.ocrComplete ?? app.ocrComplete,
          creditSummaryComplete:
            refreshed.creditSummaryComplete ?? app.creditSummaryComplete,
        });
      })
      .catch((error) => {
        console.error("Failed to refresh application status:", error);
      });
  }, [app.applicationToken, update]);

  function toggleTerms() {
    update({ termsAccepted: !app.termsAccepted });
  }

  async function submit() {
    setSubmitError(null);

    if (!isOnline) {
      setSubmitError(
        "You're offline. Please reconnect to submit your application."
      );
      return;
    }

    if (!app.applicationToken) {
      setSubmitError("Missing application token. Please restart your application.");
      return;
    }

    if (!app.selectedProductId) {
      setSubmitError("Missing product selection. Please return to Step 2.");
      return;
    }

    if (shouldBlockForMissingDocuments(app)) {
      setSubmitError("Please upload all required documents before submitting.");
      return;
    }

    if (!docsAccepted) {
      setSubmitError(
        "Your required documents must be accepted before you can sign."
      );
      return;
    }

    if (!processingComplete) {
      setSubmitError(
        "We’re still completing document and credit checks. Please check back shortly."
      );
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
      const refreshed = await ClientAppAPI.status(app.applicationToken);
      const hydrated = extractApplicationFromStatus(
        refreshed?.data || {},
        app.applicationToken
      );
      update({
        documents: hydrated.documents || app.documents,
        documentsDeferred:
          typeof hydrated.documentsDeferred === "boolean"
            ? hydrated.documentsDeferred
            : app.documentsDeferred,
        ocrComplete: hydrated.ocrComplete ?? app.ocrComplete,
        creditSummaryComplete:
          hydrated.creditSummaryComplete ?? app.creditSummaryComplete,
      });
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
          style={{
            textAlign: "center",
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.sm,
          }}
        >
          <div style={components.form.eyebrow}>Submission error</div>
          <h1 style={components.form.title}>We couldn’t submit your application</h1>
          <p style={components.form.subtitle}>{submitError}</p>
          <Button
            style={{ marginTop: tokens.spacing.sm, width: "100%", maxWidth: "260px" }}
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
          style={{
            textAlign: "center",
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.sm,
          }}
        >
          <div style={components.form.eyebrow}>Application submitted</div>
          <h1 style={components.form.title}>Thank you for your submission.</h1>
          <p style={components.form.subtitle}>
            We’ve received your application and will notify you about next
            steps. You can also review updates in your client portal.
          </p>
          <Button
            style={{ marginTop: tokens.spacing.sm, width: "100%", maxWidth: "260px" }}
            onClick={() => navigate("/portal")}
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
      const refreshed = await ClientAppAPI.status(app.applicationToken);
      const hydrated = extractApplicationFromStatus(
        refreshed?.data || {},
        app.applicationToken
      );
      update({
        documents: hydrated.documents || app.documents,
        ocrComplete: hydrated.ocrComplete ?? app.ocrComplete,
        creditSummaryComplete:
          hydrated.creditSummaryComplete ?? app.creditSummaryComplete,
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

      <Card style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
        <div>
          <h2 style={components.form.sectionTitle}>Applicant IDs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
            {idRequirements
              .filter((entry) => entry.required)
              .map((entry) => {
                const docError = docErrors[entry.key];
                const isUploading = uploadingDocs[entry.key];
                const docStatus = app.documents[entry.key]?.status;
                return (
                  <FileUploadCard
                    key={entry.key}
                    title={entry.label}
                    status={isUploading ? "Uploading" : docStatus || "missing"}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const file = event.dataTransfer.files?.[0] || null;
                      handleIdUpload(entry.key, file);
                    }}
                  >
                    <input
                      id={`id-doc-${entry.key}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e: any) =>
                        handleIdUpload(entry.key, e.target.files?.[0] || null)
                      }
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isUploading}
                      loading={isUploading}
                      onClick={() =>
                        document.getElementById(`id-doc-${entry.key}`)?.click()
                      }
                      style={{ width: "100%" }}
                    >
                      Upload ID
                    </Button>
                    {app.documents[entry.key] && (
                      <div style={components.form.helperText}>
                        Uploaded: {app.documents[entry.key].name}
                      </div>
                    )}
                    {docError && (
                      <div style={components.form.errorText}>{docError}</div>
                    )}
                    {!docError && !app.documents[entry.key] && (
                      <div style={components.form.errorText}>
                        This ID is required.
                      </div>
                    )}
                    {docStatus === "rejected" && (
                      <div style={components.form.errorText}>
                        ID rejected. Please upload a new file.
                      </div>
                    )}
                  </FileUploadCard>
                );
              })}
          </div>
        </div>

        {(!docsAccepted || !processingComplete) && (
          <Card
            variant="muted"
            data-error={true}
            style={{ background: "rgba(245, 158, 11, 0.12)" }}
          >
            <div style={layout.stackTight}>
              {!docsAccepted && (
                <div style={components.form.errorText}>
                  Required documents must be accepted before you can sign.
                </div>
              )}
              {!processingComplete && (
                <div style={components.form.errorText}>
                  OCR and credit summary checks are still running.
                </div>
              )}
            </div>
          </Card>
        )}

        <div>
          <h2 style={components.form.sectionTitle}>Terms & Conditions</h2>
          <div
            style={{
              background: tokens.colors.background,
              padding: tokens.spacing.md,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.radii.lg,
              fontSize: tokens.typography.body.fontSize,
              color: tokens.colors.textSecondary,
              whiteSpace: "pre-line",
              marginTop: tokens.spacing.xs,
            }}
          >
            {TERMS_TEXT}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: tokens.spacing.md,
          }}
        >
          <div style={layout.stackTight}>
            <label style={components.form.label}>Typed signature</label>
            <Input
              placeholder="Type your full legal name"
              value={app.typedSignature || ""}
              onChange={(e: any) => update({ typedSignature: e.target.value })}
            />
            <p style={components.form.helperText}>
              By typing your name, you are providing a legally binding signature.
            </p>
          </div>

          {hasPartner && (
            <div style={layout.stackTight}>
              <label style={components.form.label}>Business partner signature</label>
              <Input
                placeholder="Type full legal name"
                value={app.coApplicantSignature || ""}
                onChange={(e: any) =>
                  update({ coApplicantSignature: e.target.value })
                }
              />
              <p style={components.form.helperText}>
                All applicants listed in the application must sign.
              </p>
            </div>
          )}

          <div style={layout.stackTight}>
            <label style={components.form.label}>Date</label>
            <Input value={app.signatureDate || today} readOnly />
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: tokens.spacing.xs,
            fontSize: tokens.typography.label.fontSize,
            fontWeight: tokens.typography.label.fontWeight,
            color: tokens.colors.textPrimary,
          }}
        >
          <Checkbox checked={app.termsAccepted} onChange={toggleTerms} />
          <span>I agree to the Terms & Conditions</span>
        </label>

        <div style={layout.stickyCta}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
            <Button
              variant="secondary"
              style={{ width: "100%", maxWidth: "160px" }}
              onClick={() => navigate("/apply/step-5")}
            >
              ← Back
            </Button>
            <Button
              style={{ width: "100%", maxWidth: "240px" }}
              onClick={submit}
              disabled={
                !isOnline ||
                !app.termsAccepted ||
                !app.typedSignature?.trim() ||
                (hasPartner && !app.coApplicantSignature?.trim()) ||
                missingIdDocs.length > 0 ||
                (!app.documentsDeferred && missingRequiredDocs.length > 0) ||
                !docsAccepted ||
                !processingComplete
              }
            >
              Submit application
            </Button>
          </div>
        </div>
      </Card>
    </WizardLayout>
  );
}

export default Step6_Review;
