import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import {
  DefaultDocLabels,
  RequiredDocsByDefaultCategory,
} from "../data/requiredDocs";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import {
  getClientLenderProductRequirements,
} from "../api/lenders";
import {
  getRequiredDocuments,
  normalizeRequirements,
} from "./requirements";

function normalizeProductType(value?: string | null) {
  if (!value) return "";
  return value.toLowerCase().replace(/\s+/g, "_");
}

export function Step5_Documents() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const [requirementsRaw, setRequirementsRaw] = useState<any>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requirements = useMemo(
    () =>
      normalizeRequirements(requirementsRaw, {
        amountRequested: app.kyc.fundingAmount,
        productType: app.selectedProductType,
      }),
    [app.kyc.fundingAmount, app.selectedProductType, requirementsRaw]
  );

  const requiredDocs = useMemo(
    () => getRequiredDocuments(requirements),
    [requirements]
  );
  const optionalDocs = requirements.optional;
  const conditionalDocs = requirements.conditional.filter((entry) => entry.applies);

  const missingRequiredDocs = useMemo(
    () => requiredDocs.filter((doc) => !app.documents[doc]),
    [app.documents, requiredDocs]
  );

  useEffect(() => {
    if (app.currentStep !== 5) {
      update({ currentStep: 5 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    let active = true;
    async function loadRequirements() {
      if (!app.selectedProductId) {
        setDocError("Missing product selection. Please return to Step 2.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setDocError(null);
      try {
        const response = await getClientLenderProductRequirements(
          app.selectedProductId
        );
        if (active) {
          setRequirementsRaw(response);
        }
      } catch (error: any) {
        console.error("Failed to load product requirements:", error);
        const fallbackKey = normalizeProductType(app.selectedProductType);
        const fallbackDocs = fallbackKey
          ? RequiredDocsByDefaultCategory[
              fallbackKey as keyof typeof RequiredDocsByDefaultCategory
            ]
          : undefined;
        if (active) {
          if (fallbackDocs && fallbackDocs.length > 0) {
            setRequirementsRaw({ required: fallbackDocs });
          } else {
            setDocError(
              "Unable to load document requirements for this product."
            );
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
          update({ documentsDeferred: false });
        }
      }
    }

    loadRequirements();

    return () => {
      active = false;
    };
  }, [app.selectedProductId, app.selectedProductType, update]);

  useEffect(() => {
    if (!app.applicationToken) {
      setDocError("Missing application token. Please restart your application.");
      return;
    }
    if (!app.selectedProductId) {
      setDocError("Missing product selection. Please return to Step 2.");
      return;
    }
    if (!isLoading && requiredDocs.length === 0 && optionalDocs.length === 0) {
      setDocError(
        "No document requirements were provided for the selected product."
      );
      return;
    }
    setDocError(null);
  }, [
    app.applicationToken,
    app.selectedProductId,
    isLoading,
    optionalDocs.length,
    requiredDocs.length,
  ]);

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

    if (file.size > 15 * 1024 * 1024) {
      alert("File too large. Max 15 MB.");
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
      alert("Unsupported file type. Allowed: PDF, PNG, JPEG, DOCX, XLSX.");
      return;
    }

    try {
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
          },
        },
      });
    } catch (error) {
      console.error("Document upload failed:", error);
      alert("Document upload failed. Please try again.");
    }
  }

  function next() {
    if (missingRequiredDocs.length > 0) {
      alert("Please upload all required documents.");
      return;
    }
    navigate("/apply/step-6");
  }

  const canContinue =
    !docError && !isLoading && missingRequiredDocs.length === 0;

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
                <li key={doc}>{DefaultDocLabels[doc] || doc}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {requiredDocs.map((doc) => (
            <div
              key={doc}
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.layout.radius,
                padding: theme.spacing.md,
                background: theme.colors.background,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: theme.spacing.xs,
                  color: theme.colors.textPrimary,
                }}
              >
                {DefaultDocLabels[doc] || doc}
              </div>

              <Input
                type="file"
                onChange={(e: any) =>
                  handleFile(doc, e.target.files?.[0] || null)
                }
              />

              {app.documents[doc] && (
                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: "12px",
                    marginTop: theme.spacing.xs,
                  }}
                >
                  Uploaded: {app.documents[doc].name}
                </div>
              )}
            </div>
          ))}
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
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              {optionalDocs.map((doc) => (
                <li key={doc}>{DefaultDocLabels[doc] || doc}</li>
              ))}
            </ul>
          </div>
        )}

        {conditionalDocs.length > 0 && (
          <div className="space-y-3">
            <h3
              style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              Conditional documents
            </h3>
            {conditionalDocs.map((entry, index) => (
              <div key={`${entry.label}-${index}`} className="space-y-1">
                <div style={{ fontWeight: 600 }}>{entry.label}</div>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {entry.documents.map((doc) => (
                    <li key={doc}>{DefaultDocLabels[doc] || doc}</li>
                  ))}
                </ul>
              </div>
            ))}
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
