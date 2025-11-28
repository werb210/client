import { useEffect, useMemo, useState } from "react";
import { uploadDocument } from "@/api/documents";
import { createDocumentMeta } from "@/utils/documentMetadata";
import { resolveRequiredDocs } from "@/utils/resolveRequiredDocs";
import { validateFile } from "@/utils/validateFile";
import { useApplicationStore } from "@/state/applicationStore";
import { useClientSession } from "@/state/useClientSession";

const Step5_Documents = () => {
  const { token } = useClientSession();
  const {
    selectedProduct,
    requiredDocuments,
    setRequiredDocuments,
    documentUploads,
    addDocument,
  } = useApplicationStore();

  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedProduct && requiredDocuments.length === 0) {
      setRequiredDocuments(resolveRequiredDocs(selectedProduct));
    }
  }, [requiredDocuments.length, selectedProduct, setRequiredDocuments]);

  const requiredDocs = useMemo(
    () =>
      requiredDocuments.length
        ? requiredDocuments
        : selectedProduct
          ? resolveRequiredDocs(selectedProduct)
          : [],
    [requiredDocuments, selectedProduct]
  );

  async function handleUpload(category: string, file: File) {
    const validation = validateFile(file);
    if (!validation.ok) {
      alert(validation.error);
      return;
    }

    setUploading((state) => ({ ...state, [category]: true }));

    try {
      const meta = await createDocumentMeta(file, category);

      addDocument({ meta, file });

      await uploadDocument(token, meta, file);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading((state) => ({ ...state, [category]: false }));
    }
  }

  return (
    <div>
      <h2>Step 5 — Document Uploads</h2>
      <p>Upload the required documents below.</p>

      {requiredDocs.map((doc) => (
        <div key={doc.id} style={{ marginBottom: "1.5rem" }}>
          <p>
            {doc.label} {doc.required ? "*" : "(Optional)"}
          </p>
          {doc.description && (
            <p style={{ fontSize: "0.9rem", color: "#555" }}>{doc.description}</p>
          )}
          <input
            type="file"
            accept={doc.allowedMimeTypes?.join(",")}
            disabled={uploading[doc.category]}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(doc.category, f);
            }}
          />

          {documentUploads
            .filter((d) => d.meta.category === doc.category)
            .map((d) => (
              <div key={d.meta.id} style={{ fontSize: "0.9rem", color: "#444" }}>
                Uploaded: {d.meta.fileName}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default Step5_Documents;
