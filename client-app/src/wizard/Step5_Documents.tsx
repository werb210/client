import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultDocLabels } from "../data/requiredDocs";
import { ProductSync } from "../lender/productSync";
import { compileDocs, filterProductsForCategory } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export function Step5_Documents() {
  const { app, update } = useApplicationStore();

  const products = filterProductsForCategory(
    ProductSync.load(),
    app.productCategory!
  );

  const docsRequired = compileDocs(products);

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
    return docsRequired.every((doc) => Boolean(app.documents[doc]));
  }

  function next() {
    if (!allDocsPresent()) {
      alert("Please upload all required documents.");
      return;
    }
    window.location.href = "/apply/step-6";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <StepHeader step={5} title="Required Documents" />

      {docsRequired.map((doc) => (
        <Card key={doc} className="mb-3">
          <div className="font-semibold mb-2">
            {DefaultDocLabels[doc] || doc}
          </div>

          <Input
            type="file"
            onChange={(e: any) => handleFile(doc, e.target.files?.[0] || null)}
          />

          {app.documents[doc] && (
            <div className="text-borealBlue text-sm mt-1">
              Uploaded: {app.documents[doc].name}
            </div>
          )}
        </Card>
      ))}

      <Button
        className={`w-full md:w-auto ${
          allDocsPresent() ? "" : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={next}
      >
        Continue
      </Button>
    </div>
  );
}
