import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FileUploader } from "../../components/ui/FileUploader";
import { useApplicationStore } from "../../state/applicationStore";
import { useAutosave } from "@/hooks/useAutosave";

interface RequiredDocument {
  id: string;
  category: string;
  description: string;
  acceptedTypes: string[];
  required: boolean;
}

export default function RequiredDocuments() {
  const navigate = useNavigate();
  const { productCategory, setDocuments, documents, setStep } = useApplicationStore();

  const productId = productCategory;

  const [docList, setDocList] = useState<RequiredDocument[]>([]);
  const [uploads, setUploads] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);

  useAutosave("documents", [documents]);

  useEffect(() => {
    if (documents) {
      setUploads(documents);
    }
  }, [documents]);

  useEffect(() => {
    async function loadDocs() {
      if (!productId) {
        setDocList([]);
        setUploads({});
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/public/lender-products/${productId}`
        );

        const data = await res.json();
        const requiredDocs: RequiredDocument[] = data.requiredDocuments || [];

        setDocList(requiredDocs);
        const initial: Record<string, File | null> = {};
        requiredDocs.forEach((doc) => {
          initial[doc.id] = null;
        });
        setUploads(initial);
      } catch (err) {
        console.error("Unable to fetch required documents", err);
        setDocList([]);
        setUploads({});
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, [productId]);

  function updateFile(docId: string, file: File | null) {
    setUploads((state) => {
      const next = { ...state, [docId]: file };
      setDocuments(next);
      return next;
    });
  }

  function handleNext() {
    const missingRequired = docList.filter((doc) => doc.required && !uploads[doc.id]);

    if (missingRequired.length > 0) {
      alert("Please upload all required documents or choose 'Upload Later'.");
      return;
    }

    setDocuments(uploads);
    setStep(4);
    navigate("/step6-terms");
  }

  function handleUploadLater() {
    setDocuments(uploads);
    setStep(4);
    navigate("/step6-terms");
  }

  if (loading) {
    return <PageContainer title="Required Documents">Loading...</PageContainer>;
  }

  if (!productId) {
    return (
      <PageContainer title="Required Documents">
        <Card>
          <p className="text-gray-700">
            We could not determine your selected product category. Please go back and
            choose a product to see the required documents.
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={() => navigate("/step3-business")}>
              Back
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Required Documents">
      <p className="mb-4 text-gray-700">
        These documents are required for your selected product category. You can upload
        them now or choose to upload later.
      </p>

      {docList.map((doc) => (
        <Card key={doc.id} className="mb-4">
          <h3 className="mb-2 font-semibold">{doc.category}</h3>
          <p className="mb-2 text-sm text-gray-600">{doc.description}</p>

          <FileUploader
            label="Upload File"
            accept={doc.acceptedTypes?.join(",")}
            file={uploads[doc.id] ?? null}
            onChange={(file) => updateFile(doc.id, file)}
          />

          {doc.required ? (
            <p className="mt-1 text-sm text-red-600">Required</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Optional</p>
          )}
        </Card>
      ))}

      <div className="mt-6 flex justify-between">
        <Button variant="secondary" onClick={() => navigate("/step4-applicant")}>
          Back
        </Button>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleUploadLater}>
            Upload Later
          </Button>

          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
