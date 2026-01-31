import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import { ProductSync } from "../lender/productSync";
import {
  formatDocumentLabel,
  sortRequirements,
  type LenderProductRequirement,
} from "./requirements";
import { filterProductsForApplicant, parseCurrencyAmount } from "./productSelection";
import { getCountryCode } from "../utils/location";
import { aggregateRequiredDocuments } from "../documents/requiredDocuments";

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
  const ALWAYS_REQUIRED_DOCS = ["bank_statements"];
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
      const docSet = new Set<string>();
      const eligibleProducts = Array.isArray(app.eligibleProducts)
        ? app.eligibleProducts
        : [];
      const amountValue = parseCurrencyAmount(app.kyc.fundingAmount);
      const countryCode = getCountryCode(app.kyc.businessLocation);
      const fallbackProducts = ProductSync.load();
      const matchingFallback = filterProductsForApplicant(
        fallbackProducts,
        countryCode,
        amountValue
      );
      const matchingProducts =
        eligibleProducts.length > 0 ? eligibleProducts : matchingFallback;
      const aggregated = aggregateRequiredDocuments(
        matchingProducts,
        selectedCategory,
        amountValue
      );
      aggregated.forEach((entry) => docSet.add(entry.document_type));

      ALWAYS_REQUIRED_DOCS.forEach((doc) => docSet.add(doc));

      const normalized = Array.from(docSet).map((docType) => ({
        id: docType,
        document_type: docType,
        required: true,
        min_amount: null,
        max_amount: null,
      }));

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
        setRequirementsRaw(normalized);
        update({
          productRequirements: {
            ...(app.productRequirements || {}),
            aggregated: normalized,
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
    app.eligibleProducts,
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
        <div className="space-y-3">
          {requiredDocs.map((entry) => {
            const docType = entry.document_type;
            const docStatus = getDocStatus(docType);
            const docError = docErrors[docType];
            const isUploading = uploadingDocs[docType];
            return (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={docStatus !== "missing"}
                      readOnly
                    />
                    <span className="font-semibold text-borealBlue">
                      {formatDocumentLabel(docType)}
                    </span>
                  </label>
                  <span className="text-xs font-semibold text-slate-500">
                    {isUploading ? "Uploading" : docStatus}
                  </span>
                </div>
                <input
                  id={`doc-${entry.id}`}
                  type="file"
                  className="hidden"
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
                    {isUploading ? "Uploading..." : "Upload file"}
                  </Button>
                  {app.documents[docType] && (
                    <div className="text-xs text-slate-500">
                      Uploaded: {app.documents[docType].name}
                    </div>
                  )}
                  {docError && (
                    <div className="text-xs text-red-600">{docError}</div>
                  )}
                  {!docError && docStatus === "missing" && (
                    <div className="text-xs text-red-600">
                      This document is required.
                    </div>
                  )}
                  {docStatus === "rejected" && (
                    <div className="text-xs text-red-600">
                      Document rejected. Please upload a new file.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div
        className="flex flex-col sm:flex-row gap-3"
        style={{ marginTop: theme.spacing.lg }}
      >
        <Button
          style={{ width: "100%", maxWidth: "220px" }}
          onClick={next}
          disabled={!canContinue}
        >
          Continue
        </Button>
        <Button
          variant="secondary"
          style={{ width: "100%", maxWidth: "220px" }}
          onClick={uploadLater}
          disabled={isLoading || hasUploadsInFlight}
        >
          Upload later
        </Button>
      </div>
    </WizardLayout>
  );
}

export default Step5_Documents;
