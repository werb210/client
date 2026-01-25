import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import { ProductSync } from "../lender/productSync";
import {
  filterRequirementsByAmount,
  formatDocumentLabel,
  normalizeRequirementList,
  sortRequirements,
  type LenderProductRequirement,
} from "./requirements";

type DocStatus = "missing" | "uploaded" | "accepted" | "rejected";

export function Step5_Documents() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const [requirementsRaw, setRequirementsRaw] = useState<
    LenderProductRequirement[]
  >([]);
  const [docError, setDocError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  const requirements = useMemo(
    () => filterRequirementsByAmount(requirementsRaw, app.kyc.fundingAmount),
    [app.kyc.fundingAmount, requirementsRaw]
  );

  const orderedRequirements = useMemo(
    () => sortRequirements(requirements),
    [requirements]
  );
  const requiredDocs = useMemo(
    () => orderedRequirements.filter((entry) => entry.required),
    [orderedRequirements]
  );
  const optionalDocs = useMemo(
    () => orderedRequirements.filter((entry) => !entry.required),
    [orderedRequirements]
  );

  const missingRequiredDocs = useMemo(
    () =>
      requiredDocs
        .map((entry) => entry.document_type)
        .filter((docType) => !app.documents[docType]),
    [app.documents, requiredDocs]
  );

  const hasBlockingUploadErrors = useMemo(() => {
    return requiredDocs.some((entry) => {
      const docType = entry.document_type;
      const entryStatus = app.documents[docType]?.status;
      return Boolean(docErrors[docType]) || entryStatus === "rejected";
    });
  }, [app.documents, docErrors, requiredDocs]);

  const hasUploadsInFlight = useMemo(
    () => requiredDocs.some((entry) => uploadingDocs[entry.document_type]),
    [requiredDocs, uploadingDocs]
  );

  useEffect(() => {
    if (app.currentStep !== 5) {
      update({ currentStep: 5 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    let active = true;
    async function loadRequirements() {
      if (!app.applicationToken) {
        setDocError("Missing application token. Please restart your application.");
        setIsLoading(false);
        return;
      }
      if (!app.selectedProductId) {
        setDocError("Missing product selection. Please return to Step 2.");
        setIsLoading(false);
        return;
      }
      const cached = app.productRequirements?.[app.selectedProductId] || [];
      const cachedNormalized = normalizeRequirementList(cached);
      const cachedAvailable = cachedNormalized.length > 0;
      const fallbackProducts = ProductSync.load();
      const fallbackProduct = fallbackProducts.find(
        (product: any) => product?.id === app.selectedProductId
      );
      const fallbackNormalized = normalizeRequirementList(
        fallbackProduct?.required_documents ?? []
      );
      const normalized = cachedAvailable ? cachedNormalized : fallbackNormalized;

      if (active) {
        setIsLoading(true);
        setDocError(null);
        if (normalized.length === 0) {
          setDocError(
            "No document requirements were provided for the selected product."
          );
          setRequirementsRaw([]);
          setIsLoading(false);
          return;
        }
        setRequirementsRaw(normalized);
        update({
          productRequirements: {
            ...(app.productRequirements || {}),
            [app.selectedProductId]: normalized,
          },
          documentsDeferred: false,
        });
        setIsLoading(false);
      }
    }

    loadRequirements();

    return () => {
      active = false;
    };
  }, [app.selectedProductId, update]);

  useEffect(() => {
    if (!app.applicationToken) {
      setDocError("Missing application token. Please restart your application.");
      return;
    }
    if (!app.selectedProductId) {
      setDocError("Missing product selection. Please return to Step 2.");
      return;
    }
  }, [app.applicationToken, app.selectedProductId]);

  function readFileAsBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(docType: string, file: File | null) {
    if (!file || !app.applicationToken || !app.selectedProductId) return;

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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const fileType = file.type || "";
    const extension = file.name.toLowerCase();
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".xlsx"];

    const validType =
      allowedTypes.includes(fileType) ||
      allowedExtensions.some((ext) => extension.endsWith(ext));

    if (!validType) {
      setDocErrors((prev) => ({
        ...prev,
        [docType]: "Unsupported file type. Allowed: PDF, PNG, JPEG, DOCX, XLSX.",
      }));
      return;
    }

    try {
      setUploadingDocs((prev) => ({ ...prev, [docType]: true }));
      const base64 = await readFileAsBase64(file);
      const payload = {
        documents: {
          [docType]: {
            name: file.name,
            base64,
            productId: app.selectedProductId,
            documentCategory: docType,
          },
        },
      };

      await ClientAppAPI.uploadDoc(app.applicationToken, payload);

      update({
        documentsDeferred: false,
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
      console.error("Document upload failed:", error);
      setDocErrors((prev) => ({
        ...prev,
        [docType]: "Document upload failed. Please try again.",
      }));
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [docType]: false }));
    }
  }

  function next() {
    if (missingRequiredDocs.length > 0 || hasBlockingUploadErrors) {
      setDocError("Please upload all required documents.");
      return;
    }
    navigate("/apply/step-6");
  }

  const canContinue =
    !docError &&
    !isLoading &&
    missingRequiredDocs.length === 0 &&
    !hasBlockingUploadErrors &&
    !hasUploadsInFlight;

  function getDocStatus(docType: string): DocStatus {
    const entry = app.documents[docType];
    if (!entry) return "missing";
    if (entry.status === "accepted") return "accepted";
    if (entry.status === "rejected") return "rejected";
    return "uploaded";
  }

  return (
    <WizardLayout>
      <StepHeader step={5} title="Required Documents" />

      <Card className="space-y-4">
        {docError && (
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              background: "rgba(220, 38, 38, 0.08)",
              borderRadius: theme.layout.radius,
              padding: theme.spacing.md,
              fontSize: "14px",
              color: theme.colors.textPrimary,
            }}
          >
            {docError}
          </div>
        )}
        {missingRequiredDocs.length > 0 && (
          <div
            style={{
              border: `1px solid ${theme.colors.border}`,
              background: "rgba(234, 179, 8, 0.12)",
              borderRadius: theme.layout.radius,
              padding: theme.spacing.md,
              fontSize: "14px",
              color: theme.colors.textPrimary,
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: theme.spacing.xs }}>
              Missing required documents:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {missingRequiredDocs.map((doc) => (
                <li key={doc}>{formatDocumentLabel(doc)}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {requiredDocs.map((entry) => {
            const docType = entry.document_type;
            const docStatus = getDocStatus(docType);
            const docError = docErrors[docType];
            const isUploading = uploadingDocs[docType];
            return (
            <div
              key={entry.id}
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.layout.radius,
                padding: theme.spacing.md,
                background: theme.colors.background,
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    style={{
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {formatDocumentLabel(docType)}
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "#1d4ed8",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    Required
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Status:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {isUploading ? "Uploading" : docStatus}
                  </span>
                </div>
              </div>

              <Input
                id={`doc-${entry.id}`}
                type="file"
                style={{ display: "none" }}
                onChange={(e: any) =>
                  handleFile(docType, e.target.files?.[0] || null)
                }
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById(`doc-${entry.id}`)?.click()
                  }
                  style={{ width: "100%" }}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
                {app.documents[docType] && (
                  <div
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: "12px",
                    }}
                  >
                    Uploaded: {app.documents[docType].name}
                  </div>
                )}
                {docError && (
                  <div style={{ color: "#dc2626", fontSize: "12px" }}>
                    {docError}
                  </div>
                )}
                {!docError && docStatus === "missing" && (
                  <div style={{ color: "#dc2626", fontSize: "12px" }}>
                    This document is required.
                  </div>
                )}
                {docStatus === "rejected" && (
                  <div style={{ color: "#dc2626", fontSize: "12px" }}>
                    Document rejected. Please upload a new file.
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>

        {optionalDocs.length > 0 && (
          <div className="space-y-2">
            <h3
              style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              Optional documents
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {optionalDocs.map((entry) => {
                const docType = entry.document_type;
                const docStatus = getDocStatus(docType);
                const docError = docErrors[docType];
                const isUploading = uploadingDocs[docType];
                return (
                  <div
                    key={entry.id}
                    style={{
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: theme.layout.radius,
                      padding: theme.spacing.md,
                      background: theme.colors.background,
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          style={{
                            fontWeight: 600,
                            color: theme.colors.textPrimary,
                          }}
                        >
                          {formatDocumentLabel(docType)}
                        </div>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "rgba(148, 163, 184, 0.2)",
                            color: "#475569",
                            border: "1px solid rgba(148, 163, 184, 0.4)",
                          }}
                        >
                          Optional
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: theme.colors.textSecondary,
                        }}
                      >
                        Status:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {isUploading ? "Uploading" : docStatus}
                        </span>
                      </div>
                    </div>

                    <Input
                      id={`doc-${entry.id}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e: any) =>
                        handleFile(docType, e.target.files?.[0] || null)
                      }
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isUploading}
                        onClick={() =>
                          document.getElementById(`doc-${entry.id}`)?.click()
                        }
                        style={{ width: "100%" }}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                      {app.documents[docType] && (
                        <div
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: "12px",
                          }}
                        >
                          Uploaded: {app.documents[docType].name}
                        </div>
                      )}
                      {docError && (
                        <div style={{ color: "#dc2626", fontSize: "12px" }}>
                          {docError}
                        </div>
                      )}
                      {docStatus === "rejected" && (
                        <div style={{ color: "#dc2626", fontSize: "12px" }}>
                          Document rejected. Please upload a new file.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Button
        style={{
          width: "100%",
          maxWidth: "200px",
          marginTop: theme.spacing.lg,
        }}
        onClick={next}
        disabled={!canContinue}
      >
        Continue
      </Button>
    </WizardLayout>
  );
}

export default Step5_Documents;
