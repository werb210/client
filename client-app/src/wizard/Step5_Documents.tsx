import { useEffect, useState } from "react";
import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultDocLabels } from "../data/requiredDocs";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function Step5_Documents() {
  const { app, update } = useApplicationStore();
  const [docsRequired, setDocsRequired] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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
        if (active) {
          setDocsRequired(Array.isArray(required) ? required : []);
        }
      } catch {
        if (active) {
          setDocsRequired([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (app.applicationToken) {
      loadDocs();
    } else {
      setLoading(false);
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
    window.location.href = "/apply/step-6";
  }

  async function defer() {
    if (!app.applicationToken) return;
    setMessage(null);
    try {
      await ClientAppAPI.deferDocuments(app.applicationToken);
      await ClientAppAPI.update(app.applicationToken, {
        status: "PENDING_DOCUMENTS",
      });
      setMessage(
        "We saved your application and sent a secure upload link by SMS."
      );
    } catch {
      setMessage("Unable to defer documents. Please try again.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <StepHeader step={5} title="Required Documents" />

      <Card className="space-y-4">
        {loading && (
          <div className="text-sm text-slate-500">
            Loading required documents…
          </div>
        )}

        {!loading && docsRequired.length === 0 && (
          <div className="text-sm text-slate-500">
            Your required document list is loading. Please refresh if this
            persists.
          </div>
        )}

        {docsRequired.map((doc) => (
          <div key={doc} className="border border-slate-200 rounded-xl p-4">
            <div className="font-semibold mb-2">
              {DefaultDocLabels[doc] || doc}
            </div>

            <Input
              type="file"
              onChange={(e: any) =>
                handleFile(doc, e.target.files?.[0] || null)
              }
            />

            {app.documents[doc] && (
              <div className="text-borealBlue text-sm mt-2">
                Uploaded: {app.documents[doc].name}
              </div>
            )}
          </div>
        ))}

        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-900">
          <p>
            Your application will not be accepted until you supply the required
            documents. We will send you a link to upload all documents.
          </p>
          <button
            className="boreal-button boreal-button-secondary mt-3 px-5 h-12"
            onClick={defer}
          >
            Click here to upload your documents later
          </button>
        </div>

        {message && <div className="text-sm text-borealBlue">{message}</div>}
      </Card>

      <Button
        className={`mt-6 w-full md:w-auto ${
          allDocsPresent() ? "" : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={next}
        disabled={!allDocsPresent()}
      >
        Continue
      </Button>
    </div>
  );
}
