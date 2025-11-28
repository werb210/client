import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRequiredDocuments, uploadClientDocument } from "../../api/clientDocuments";
import { useAuthContext } from "../../context/AuthContext";
import {
  useApplication,
  type RequiredDoc,
  type UploadedDocument,
} from "../../state/application";

export default function Step5() {
  const nav = useNavigate();
  const { token } = useAuthContext();

  const {
    step1,
    requiredDocs,
    uploadedDocs,
    setStep1,
    setRequiredDocs,
    addUploadedDoc,
  } = useApplication();

  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const selectedCategory =
    (step1 as Record<string, any> | null)?.selectedProductCategory ||
    localStorage.getItem("app_selected_category") ||
    "";
  const applicationId =
    (step1 as Record<string, any> | null)?.applicationId ||
    localStorage.getItem("app_application_id") ||
    "";

  useEffect(() => {
    if (!token) nav("/");
  }, [nav, token]);

  useEffect(() => {
    const storedDocs = localStorage.getItem("app_required_docs");
    if (storedDocs) {
      try {
        const parsed: RequiredDoc[] = JSON.parse(storedDocs);
        setRequiredDocs(parsed);
        setLoadingDocs(false);
      } catch (error) {
        console.error("Failed to restore required docs", error);
      }
    }

    const storedUploads = localStorage.getItem("app_uploaded_docs");
    if (storedUploads) {
      try {
        const parsed: UploadedDocument[] = JSON.parse(storedUploads);
        parsed.forEach((doc) => addUploadedDoc(doc));
      } catch (error) {
        console.error("Failed to restore uploaded docs", error);
      }
    }
  }, [addUploadedDoc, setRequiredDocs]);

  useEffect(() => {
    async function load() {
      if (!selectedCategory) {
        setLoadingDocs(false);
        return;
      }

      try {
        const docs = await fetchRequiredDocuments(selectedCategory);
        setRequiredDocs(docs);
        localStorage.setItem("app_required_docs", JSON.stringify(docs));
        setStep1({ ...(step1 ?? {}), selectedProductCategory: selectedCategory });
      } finally {
        setLoadingDocs(false);
      }
    }

    load();
  }, [selectedCategory, setRequiredDocs, setStep1, step1]);

  if (!token) return null;

  function handleFile(doc: RequiredDoc, file?: File) {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File too large (max 20 MB)");
      return;
    }

    if (
      !["pdf", "jpg", "jpeg", "png", "docx"].some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )
    ) {
      alert("Unsupported file type");
      return;
    }

    if (!applicationId) {
      alert("Missing application ID. Please restart the application flow.");
      return;
    }

    upload(doc, file);
  }

  async function upload(doc: RequiredDoc, file: File) {
    setUploadProgress((p) => ({ ...p, [doc.id]: 0 }));

    try {
      const serverResponse = await uploadClientDocument({
        token,
        applicationId,
        docId: doc.id,
        file,
        onProgress: (percent) => {
          setUploadProgress((p) => ({ ...p, [doc.id]: percent }));
        },
      });

      const saved: UploadedDocument = {
        docId: doc.id,
        fileName: file.name,
        fileType: serverResponse.mimeType,
        sizeBytes: serverResponse.sizeBytes,
        serverKey: serverResponse.s3Key,
        uploadedAt: new Date().toISOString(),
      };

      addUploadedDoc(saved);

      const updated = [...uploadedDocs.filter((d) => d.docId !== doc.id), saved];
      localStorage.setItem("app_uploaded_docs", JSON.stringify(updated));
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  }

  function next() {
    nav("/apply/step-6");
  }

  function skip() {
    nav("/apply/submitted-upload-later");
  }

  if (loadingDocs) {
    return <div className="p-6 text-center text-lg">Loading required documents…</div>;
  }

  if (!requiredDocs.length) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">Upload Required Documents</h1>
        <p className="text-gray-700">
          No required documents found for the selected product. Please go back and
          choose a category.
        </p>
        <button
          className="mt-6 text-blue-600 underline"
          onClick={() => nav("/apply/step-3")}
        >
          Choose Category
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Required Documents</h1>

      {requiredDocs.map((doc) => {
        const uploaded = uploadedDocs.find((d) => d.docId === doc.id);

        return (
          <div key={doc.id} className="border p-4 rounded mb-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-lg">{doc.name}</div>
                {doc.description && (
                  <div className="text-sm text-gray-600">{doc.description}</div>
                )}
              </div>

              {uploaded ? (
                <div className="text-green-600 font-medium">
                  Uploaded: {uploaded.fileName}
                </div>
              ) : (
                <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFile(doc, e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {uploadProgress[doc.id] > 0 && uploadProgress[doc.id] < 100 && (
              <div className="mt-3 w-full bg-gray-200 rounded h-3">
                <div
                  style={{ width: `${uploadProgress[doc.id]}%` }}
                  className="h-3 bg-blue-600 rounded"
                />
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-between mt-10">
        <button className="text-blue-600 underline" onClick={() => nav("/apply/step-4")}>
          Back
        </button>

        <div className="flex gap-4">
          <button className="underline text-gray-600" onClick={skip}>
            Upload Later
          </button>

          <button className="px-6 py-3 bg-blue-600 text-white rounded" onClick={next}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
