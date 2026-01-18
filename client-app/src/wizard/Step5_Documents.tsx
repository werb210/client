import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultDocLabels } from "../data/requiredDocs";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";
import { ProductSync } from "../lender/productSync";

export function Step5_Documents() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const docsRequired = useMemo(() => {
    if (!app.productCategory) return [];
    const source =
      app.eligibleProducts.length > 0 ? app.eligibleProducts : products;
    const docs = source
      .filter((product) => product.category === app.productCategory)
      .flatMap((product) => product.requiredDocs || []);
    return Array.from(new Set(docs));
  }, [app.eligibleProducts, app.productCategory, products]);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    if (app.currentStep !== 5) {
      update({ currentStep: 5 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      setIsLoading(true);
      try {
        const synced = await ProductSync.sync();
        if (active) {
          setProducts(synced);
        }
      } catch (error) {
        console.error("Failed to sync lender products:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!app.applicationToken) {
      setDocError("Missing application token. Please restart your application.");
      return;
    }
    if (!app.productCategory) {
      setDocError("Missing product category selection. Please return to Step 2.");
      return;
    }
    if (!isLoading && docsRequired.length === 0) {
      setDocError(
        "No document requirements were provided for the selected product."
      );
      return;
    }
    setDocError(null);
  }, [app.applicationToken, app.productCategory, docsRequired.length, isLoading]);

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
    if (!file) return;

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
          },
        },
      };

      await ClientAppAPI.uploadDoc(app.applicationToken!, payload);

      update({
        documentsDeferred: false,
        documents: {
          ...app.documents,
          [docType]: { name: file.name, base64, category: docType },
        },
      });
    } catch (error) {
      console.error("Document upload failed:", error);
      alert("Document upload failed. Please try again.");
    }
  }

  function allDocsPresent() {
    if (app.documentsDeferred) return true;
    return docsRequired.length > 0
      ? docsRequired.every((doc) => Boolean(app.documents[doc]))
      : false;
  }

  function next() {
    if (!allDocsPresent()) {
      alert("Please upload all required documents.");
      return;
    }
    navigate("/apply/step-6");
  }

  const handleUploadLater = () => {
    update({ documentsDeferred: true });
    navigate("/apply/step-6");
  };

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
          <p>
            Your application will not be accepted until you supply the required
            documents. We will send you a link to upload all documents.
          </p>
          <Button
            variant="secondary"
            style={{ marginTop: theme.spacing.sm, width: "100%" }}
            onClick={handleUploadLater}
          >
            Upload documents later
          </Button>
          {app.documentsDeferred && (
            <p style={{ marginTop: theme.spacing.sm, fontSize: "12px" }}>
              Warning: your application will stay in pending status until the
              required documents are received.
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {docsRequired.map((doc) => (
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
      </Card>

      <Button
        style={{
          width: "100%",
          maxWidth: "200px",
          marginTop: theme.spacing.lg,
        }}
        onClick={next}
        disabled={Boolean(docError) || (!allDocsPresent() && !app.documentsDeferred)}
      >
        Continue
      </Button>
    </WizardLayout>
  );
}

export default Step5_Documents;
