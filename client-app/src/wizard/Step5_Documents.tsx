import { useEffect, useState } from "react";
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

export function Step5_Documents() {
  const { app, update } = useApplicationStore();
  const navigate = useNavigate();
  const [docsRequired, setDocsRequired] = useState<string[]>([
    "bank_statements_6m",
  ]);

  useEffect(() => {
    if (app.currentStep !== 5) {
      update({ currentStep: 5 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    let active = true;
    async function loadDocs() {
      try {
        const res = await ClientAppAPI.status(app.applicationToken!);
        const data = res?.data || {};
        const required =
          data.requiredDocuments ||
          data.required_docs ||
          data.documentsRequired ||
          data.documents ||
          [];
        const normalized = Array.isArray(required) ? required : [];
        const merged = Array.from(
          new Set(["bank_statements_6m", ...normalized])
        );
        if (active) {
          setDocsRequired(merged);
        }
      } catch {
        if (active) {
          setDocsRequired(["bank_statements_6m"]);
        }
      }
    }

    if (app.applicationToken) {
      loadDocs();
    }

    return () => {
      active = false;
    };
  }, [app.applicationToken]);

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

    const form = new FormData();
    form.append("document", file);
    form.append("type", docType);

    await ClientAppAPI.uploadDoc(app.applicationToken!, form);

    update({
      documents: {
        ...app.documents,
        [docType]: { name: file.name, uploaded: true }
      }
    });
  }

  function allDocsPresent() {
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

  const handleUploadLater = async () => {
    update({ documentsDeferred: true });
    if (app.applicationToken) {
      try {
        await ClientAppAPI.deferDocuments(app.applicationToken);
      } catch {
        // Allow navigation even if defer request fails.
      }
    }
    navigate("/apply/step-6");
  };

  return (
    <WizardLayout>
      <StepHeader step={5} title="Required Documents" />

      <Card className="space-y-4">
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

      </Card>

      <Button
        style={{
          width: "100%",
          maxWidth: "200px",
          marginTop: theme.spacing.lg,
        }}
        onClick={next}
        disabled={!allDocsPresent()}
      >
        Continue
      </Button>
    </WizardLayout>
  );
}

export default Step5_Documents;
