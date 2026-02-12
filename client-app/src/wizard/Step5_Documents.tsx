import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { ProductSync } from "../lender/productSync";
import {
  formatDocumentLabel,
  sortRequirements,
  type LenderProductRequirement,
} from "./requirements";
import { filterProductsForApplicant, parseCurrencyAmount } from "./productSelection";
import { getCountryCode } from "../utils/location";
import {
  aggregateRequiredDocuments,
  ensureAlwaysRequiredDocuments,
  mergeRequirementLists,
} from "../documents/requiredDocuments";
import { extractApplicationFromStatus } from "../applications/resume";
import { FileUploadCard } from "../components/FileUploadCard";
import { Checkbox } from "../components/ui/Checkbox";
import { DocumentUploadList } from "../components/DocumentUploadList";
import { Spinner } from "../components/ui/Spinner";
import { useForegroundRefresh } from "../hooks/useForegroundRefresh";
import { components, layout, scrollToFirstError, tokens } from "@/styles";
import { trackEvent } from "../utils/analytics";
import { resolveStepGuard } from "./stepGuard";
import { extractRequiredDocumentsFromStatus } from "../documents/requiredDocumentsFromStatus";
import { syncRequiredDocumentsFromStatus } from "../documents/requiredDocumentsCache";
import {
  getRejectionMessage,
  resolveDocumentStatus,
  type DocumentStatus,
} from "../documents/documentStatus";

const DOCUMENT_CATEGORIES = [
  { label: "Bank Statements", match: (doc: string) => doc.includes("bank") },
  {
    label: "Tax & Financials",
    match: (doc: string) =>
      doc.includes("tax") ||
      doc.includes("financial") ||
      doc.includes("balance") ||
      doc.includes("profit") ||
      doc.includes("loss") ||
      doc.includes("cash_flow"),
  },
  {
    label: "Business Documents",
    match: (doc: string) =>
      doc.includes("license") ||
      doc.includes("incorporation") ||
      doc.includes("ownership") ||
      doc.includes("business"),
  },
  {
    label: "Transaction Documents",
    match: (doc: string) =>
      doc.includes("invoice") ||
      doc.includes("purchase_order") ||
      doc.includes("contract") ||
      doc.includes("equipment") ||
      doc.includes("lease"),
  },
  {
    label: "Applicant Identification",
    match: (doc: string) =>
      doc.includes("id") ||
      doc.includes("license") ||
      doc.includes("passport"),
  },
];

function resolveDocumentCategory(docType: string) {
  const normalized = docType.toLowerCase();
  const match = DOCUMENT_CATEGORIES.find((entry) => entry.match(normalized));
  return match?.label || "Additional Requirements";
}

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
  const selectedCategory =
    app.productCategory ||
    app.selectedProductType ||
    app.selectedProduct?.product_type ||
    app.selectedProduct?.name ||
    "";

  const orderedRequirements = useMemo(() => {
    return sortRequirements(requirementsRaw);
  }, [requirementsRaw]);
  const requiredDocs = useMemo(
    () => orderedRequirements.filter((entry) => entry.required),
    [orderedRequirements]
  );
  const groupedRequirements = useMemo(() => {
    const groups = new Map<string, LenderProductRequirement[]>();
    requiredDocs.forEach((entry) => {
      const category = resolveDocumentCategory(entry.document_type);
      const list = groups.get(category) || [];
      list.push(entry);
      groups.set(category, list);
    });
    return Array.from(groups.entries());
  }, [requiredDocs]);

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
    const guard = resolveStepGuard(app.currentStep, 5);
    if (!guard.allowed) {
      navigate(`/apply/step-${guard.redirectStep}`, { replace: true });
    }
  }, [app.currentStep, navigate]);

  useEffect(() => {
    if (docError || missingRequiredDocs.length > 0 || hasBlockingUploadErrors) {
      scrollToFirstError();
    }
  }, [docError, hasBlockingUploadErrors, missingRequiredDocs.length]);

  useEffect(() => {
    let active = true;
    async function loadRequirements() {
      if (!app.applicationToken) {
        setDocError("Missing application token. Please restart your application.");
        setIsLoading(false);
        return;
      }
      const amountValue = parseCurrencyAmount(app.kyc.fundingAmount);
      const countryCode = getCountryCode(app.kyc.businessLocation);
      let lenderProducts = ProductSync.load();
      if (!lenderProducts.length) {
        try {
          lenderProducts = await ProductSync.sync();
        } catch (error) {
          console.error("Failed to refresh lender products:", error);
        }
      }
      const matchingProducts = filterProductsForApplicant(
        lenderProducts,
        countryCode,
        amountValue
      );
      const aggregated = aggregateRequiredDocuments(
        matchingProducts,
        selectedCategory,
        amountValue
      );
      const normalized = ensureAlwaysRequiredDocuments(aggregated);

      if (active) {
        setIsLoading(true);
        setDocError(null);
        if (normalized.length === 0) {
          setDocError(
            "No document requirements were provided for the selected products."
          );
          setRequirementsRaw([]);
          setIsLoading(false);
          return;
        }
        let cachedFromStatus = null;
        try {
          const status = await ClientAppAPI.status(app.applicationToken);
          cachedFromStatus = extractRequiredDocumentsFromStatus(status.data);
        } catch (error) {
          console.error("Failed to load required documents:", error);
        }
        const merged = cachedFromStatus
          ? ensureAlwaysRequiredDocuments(
              mergeRequirementLists(normalized, cachedFromStatus)
            )
          : normalized;
        setRequirementsRaw(merged);
        update({
          productRequirements: {
            ...(app.productRequirements || {}),
            aggregated: merged,
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
  }, [
    app.kyc.businessLocation,
    app.kyc.fundingAmount,
    app.selectedProductId,
    selectedCategory,
    update,
  ]);

  useEffect(() => {
    if (!app.applicationToken) {
      setDocError("Missing application token. Please restart your application.");
      return;
    }
  }, [app.applicationToken, app.selectedProductId]);

  const refreshDocumentStatus = useCallback(() => {
    if (!app.applicationToken) return;
    ClientAppAPI.status(app.applicationToken)
      .then((res) => {
        const refreshed = extractApplicationFromStatus(
          res?.data || {},
          app.applicationToken
        );
        const cachedRequirements = syncRequiredDocumentsFromStatus(res?.data);
        update({
          documents: refreshed.documents || app.documents,
          documentsDeferred:
            typeof refreshed.documentsDeferred === "boolean"
              ? refreshed.documentsDeferred
              : app.documentsDeferred,
          documentReviewComplete:
            refreshed.documentReviewComplete ?? app.documentReviewComplete,
          financialReviewComplete:
            refreshed.financialReviewComplete ?? app.financialReviewComplete,
          productRequirements: cachedRequirements
            ? {
                ...(app.productRequirements || {}),
                aggregated: cachedRequirements,
              }
            : app.productRequirements,
        });
      })
      .catch((error) => {
        console.error("Failed to refresh document status:", error);
      });
  }, [
    app.applicationToken,
    app.documents,
    app.documentsDeferred,
    app.documentReviewComplete,
    app.financialReviewComplete,
    update,
  ]);

  useEffect(() => {
    refreshDocumentStatus();
  }, [refreshDocumentStatus]);

  useForegroundRefresh(() => {
    refreshDocumentStatus();
  }, [refreshDocumentStatus]);

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
      const refreshed = await ClientAppAPI.status(app.applicationToken);
      const hydrated = extractApplicationFromStatus(
        refreshed?.data || {},
        app.applicationToken
      );

      update({
        documentsDeferred: false,
        documents: hydrated.documents || app.documents,
        documentReviewComplete:
          hydrated.documentReviewComplete ?? app.documentReviewComplete,
        financialReviewComplete:
          hydrated.financialReviewComplete ?? app.financialReviewComplete,
      });
      setDocErrors((prev) => ({ ...prev, [docType]: "" }));
      trackEvent("client_document_uploaded", { documentType: docType });
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

  async function uploadLater() {
    if (!app.applicationToken) {
      setDocError("Missing application token. Please restart your application.");
      return;
    }
    try {
      await ClientAppAPI.deferDocuments(app.applicationToken);
      update({ documentsDeferred: true });
      navigate("/apply/step-6");
    } catch (error) {
      console.error("Failed to defer documents:", error);
      setDocError("Couldn't defer documents. Please try again.");
    }
  }

  const canContinue =
    !docError &&
    !isLoading &&
    missingRequiredDocs.length === 0 &&
    !hasBlockingUploadErrors &&
    !hasUploadsInFlight;

  function getDocStatus(docType: string): DocumentStatus {
    return resolveDocumentStatus(app.documents[docType]);
  }

  return (
    <WizardLayout>
      <StepHeader step={5} title="Required Documents" />

      <Card style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
            <Spinner />
            <span style={components.form.helperText}>Loading document requirements…</span>
          </div>
        )}
        {docError && (
          <Card variant="muted" data-error={true}>
            <div style={components.form.errorText}>{docError}</div>
          </Card>
        )}
        {missingRequiredDocs.length > 0 && (
          <Card
            variant="muted"
            data-error={true}
            style={{ background: "rgba(245, 158, 11, 0.12)" }}
          >
            <div style={{ fontWeight: 600, marginBottom: tokens.spacing.xs }}>
              Missing required documents:
            </div>
            <DocumentUploadList
              documents={missingRequiredDocs.map(formatDocumentLabel)}
            />
          </Card>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
          {groupedRequirements.map(([category, entries]) => (
            <div key={category} style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              <div style={{ fontWeight: 600, color: tokens.colors.textSecondary }}>
                {category}
              </div>
              {entries.map((entry) => {
                const docType = entry.document_type;
                const docStatus = getDocStatus(docType);
                const docError = docErrors[docType];
                const isUploading = uploadingDocs[docType];
                return (
                  <FileUploadCard
                    key={entry.id}
                    title={formatDocumentLabel(docType)}
                    status={isUploading ? "Uploading" : docStatus}
                    data-error={
                      Boolean(docError) ||
                      docStatus === "missing" ||
                      docStatus === "rejected"
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const file = event.dataTransfer.files?.[0] || null;
                      handleFile(docType, file);
                    }}
                  >
                    <input
                      id={`doc-${entry.id}`}
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e: any) =>
                        handleFile(docType, e.target.files?.[0] || null)
                      }
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: tokens.spacing.xs,
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: tokens.spacing.xs,
                        }}
                      >
                        <Checkbox checked={docStatus !== "missing"} readOnly />
                        <span
                          style={{ fontWeight: 600, color: tokens.colors.primary }}
                        >
                          {formatDocumentLabel(docType)}
                        </span>
                      </label>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isUploading}
                        loading={isUploading}
                        onClick={() =>
                          document.getElementById(`doc-${entry.id}`)?.click()
                        }
                        style={{ width: "100%" }}
                      >
                        Upload file
                      </Button>
                      {app.documents[docType] && (
                        <div style={components.form.helperText}>
                          Uploaded: {app.documents[docType].name}
                        </div>
                      )}
                      {docError && (
                        <div style={components.form.errorText}>{docError}</div>
                      )}
                      {!docError && docStatus === "missing" && (
                        <div style={components.form.errorText}>
                          This document is required.
                        </div>
                      )}
                      {docStatus === "rejected" && (
                        <div style={components.form.errorText}>
                          {getRejectionMessage(app.documents[docType])}
                        </div>
                      )}
                    </div>
                  </FileUploadCard>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <div style={{ ...layout.stickyCta, marginTop: tokens.spacing.lg }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
          <Button
            style={{ width: "100%", maxWidth: "220px" }}
            onClick={next}
            disabled={!canContinue}
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            style={{ width: "100%", maxWidth: "220px" }}
            onClick={uploadLater}
            disabled={isLoading || hasUploadsInFlight}
          >
            Skip documents
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}

export default Step5_Documents;
