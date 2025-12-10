import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultDocLabels } from "../data/requiredDocs";
import { ProductSync } from "../lender/productSync";
import { compileDocs, filterProductsForCategory } from "../lender/compile";
import { ClientAppAPI } from "../api/clientApp";

export function Step5_Documents() {
  const { app, update } = useApplicationStore();

  const products = filterProductsForCategory(
    ProductSync.load(),
    app.productCategory!
  );

  const docsRequired = compileDocs(products);

  async function handleFile(docType: string, file: File | null) {
    if (!file) return;

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
    <div>
      <h1 className="text-xl font-bold mb-6">Step 5: Required Documents</h1>

      {docsRequired.map((doc) => (
        <div key={doc} className="border p-4 mb-4 rounded bg-white">
          <div className="font-semibold mb-2">
            {DefaultDocLabels[doc] || doc}
          </div>

          <input
            type="file"
            className="block w-full"
            onChange={(e) => handleFile(doc, e.target.files?.[0] || null)}
          />

          {app.documents[doc] && (
            <div className="text-green-600 text-sm mt-1">
              Uploaded: {app.documents[doc].name}
            </div>
          )}
        </div>
      ))}

      <button
        className={`p-2 text-white ${
          allDocsPresent() ? "bg-borealBlue" : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={next}
      >
        Continue
      </button>
    </div>
  );
}
