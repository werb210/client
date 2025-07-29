import React, { useEffect, useState } from "react";
import { useSearch } from "wouter";
import DocumentUploadSection from "../components/DocumentUploadSection";

const UploadDocuments: React.FC = () => {
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const applicationIdFromQuery = urlParams.get("app");

  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [apiFailed, setApiFailed] = useState(false);
  
  console.log('🆕 [NEW UploadDocuments] Loading with app ID:', applicationIdFromQuery);

  // Set applicationId from query
  useEffect(() => {
    if (applicationIdFromQuery) {
      setApplicationId(applicationIdFromQuery);
    }
  }, [applicationIdFromQuery]);

  // Attempt to fetch application data
  useEffect(() => {
    const fetchData = async () => {
      if (!applicationIdFromQuery) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/public/applications/${applicationIdFromQuery}`
        );

        if (!res.ok) throw new Error("API call failed");

        const data = await res.json();
        setApplicationData(data);
      } catch (error) {
        console.error("❌ Failed to fetch application data:", error);
        setApiFailed(true);
      }
    };

    fetchData();
  }, [applicationIdFromQuery]);

  // Render error if query param is missing
  if (!applicationId) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-semibold text-red-600">
          Invalid application link
        </h1>
        <p className="mt-2">Please check the SMS link or contact support.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Required Documents</h1>

      {!applicationData && apiFailed && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
          <p className="text-yellow-800">
            We couldn't load your full application, but you can still upload your documents.
          </p>
        </div>
      )}

      <DocumentUploadSection applicationId={applicationId} />
    </div>
  );
};

export default UploadDocuments;