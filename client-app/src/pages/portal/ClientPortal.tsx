import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";

interface StatusHistoryItem {
  status: string;
  timestamp: string;
}

interface RequiredDocument {
  id: string;
  label: string;
}

interface UploadedDocument {
  fileName: string;
}

interface ApplicationData {
  id: string;
  status: string;
  submittedAt: string;
  statusHistory?: StatusHistoryItem[];
  requiredDocuments: RequiredDocument[];
  uploadedDocuments?: Record<string, UploadedDocument>;
}

type UploadChangeEvent = ChangeEvent<HTMLInputElement>;

export default function ClientPortal() {
  const [search] = useSearchParams();
  const applicationId = search.get("applicationId");

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<ApplicationData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const token = useMemo(() => localStorage.getItem("clientToken"), []);

  const fetchApplication = useCallback(async () => {
    if (!applicationId || !token) {
      setError("Missing application details. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/public/applications/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Unable to load application");
      }

      const data = (await res.json()) as ApplicationData;
      setApp(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load application. Please try again.");
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId, token]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleDocUpload = async (
    e: UploadChangeEvent,
    docId: string
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !applicationId || !token) return;

    setUploading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/public/applications/${applicationId}/documents/create-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            docId,
            fileName: file.name,
            mimeType: file.type,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Unable to create upload session");
      }

      const { uploadUrl } = (await res.json()) as { uploadUrl: string };

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      await fetchApplication();
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageContainer title="Loading portal..." />;

  if (error)
    return (
      <PageContainer title="Your Application Portal">
        <p className="text-red-600">{error}</p>
      </PageContainer>
    );

  if (!app)
    return (
      <PageContainer title="Your Application Portal">
        <p className="text-red-600">Application not found.</p>
      </PageContainer>
    );

  return (
    <PageContainer title="Your Application Portal">
      <h2 className="text-xl font-bold mb-4">Application #{app.id}</h2>

      {/* --- STATUS --- */}
      <div className="p-4 border rounded mb-6">
        <h3 className="font-semibold mb-2">Status</h3>
        <p className="text-lg text-blue-600">{app.status}</p>

        <ul className="mt-3 text-sm">
          <li>
            • Submitted: {new Date(app.submittedAt).toLocaleString()}
          </li>
          {app.statusHistory?.map((s, idx) => (
            <li key={idx}>
              • {s.status} — {new Date(s.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      {/* --- DOCUMENTS --- */}
      <div className="p-4 border rounded mb-6">
        <h3 className="font-semibold mb-3">Documents</h3>

        {app.requiredDocuments.map((doc) => {
          const uploaded = app.uploadedDocuments?.[doc.id];
          return (
            <div
              key={doc.id}
              className="border p-3 mb-3 rounded bg-gray-50"
            >
              <p className="font-medium">{doc.label}</p>

              {uploaded ? (
                <p className="text-green-600 text-sm mt-1">
                  Uploaded: {uploaded.fileName}
                </p>
              ) : (
                <div className="mt-2">
                  <label className="block text-sm mb-1">Upload file:</label>
                  <input
                    type="file"
                    onChange={(e) => handleDocUpload(e, doc.id)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {uploading && <p className="text-blue-600">Uploading...</p>}
      </div>

      {/* --- MESSAGES / TALK TO HUMAN --- */}
      <div className="p-4 border rounded mb-6">
        <h3 className="font-semibold mb-3">Messages</h3>

        <Button
          variant="secondary"
          onClick={() =>
            (window.location.href = `/portal/messages?applicationId=${app.id}`)
          }
        >
          Open Message Center
        </Button>
      </div>

      {/* --- AI CHATBOT --- */}
      <div className="p-4 border rounded mb-6">
        <h3 className="font-semibold mb-3">AI Assistant</h3>

        <Button
          variant="secondary"
          onClick={() =>
            (window.location.href = `/portal/assistant?applicationId=${app.id}`)
          }
        >
          Ask the AI Assistant
        </Button>
      </div>

      {/* --- LOGOUT --- */}
      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          localStorage.removeItem("clientToken");
          window.location.href = "/";
        }}
      >
        Log Out
      </Button>
    </PageContainer>
  );
}
