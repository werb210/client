import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ApplicationPortalView,
  getStageHelperText,
  normalizeDocumentsResponse,
} from "@/portal/ApplicationPortalView";
import {
  fetchApplication,
  fetchApplicationDocuments,
  uploadApplicationDocument,
} from "@/api/applications";
import { components, layout, tokens } from "@/styles";

export function ApplicationPortalPage() {
  const { id } = useParams();
  const location = useLocation();
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState(
    [] as ReturnType<typeof normalizeDocumentsResponse>
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    Record<string, { uploading: boolean; progress: number }>
  >({});

  const refreshDocuments = useCallback(async () => {
    if (!id) return;
    const response = await fetchApplicationDocuments(id);
    setDocuments(normalizeDocumentsResponse(response));
  }, [id]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [applicationRes, documentsRes] = await Promise.all([
          fetchApplication(id),
          fetchApplicationDocuments(id),
        ]);
        if (!active) return;
        setApplication(applicationRes?.application ?? applicationRes);
        setDocuments(normalizeDocumentsResponse(documentsRes));
      } catch (err: any) {
        if (!active) return;
        console.error("Failed to load application portal:", err);
        setError("We couldn't load your application details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!location.pathname.endsWith("/documents")) return;
    const target = document.getElementById("application-documents");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname]);

  const businessName = useMemo(() => {
    return (
      application?.business?.legalName ||
      application?.business?.name ||
      application?.business_legal_name ||
      application?.business_name ||
      "Your application"
    );
  }, [application]);

  const stage = useMemo(() => {
    return (
      application?.stage ||
      application?.status ||
      application?.pipeline_stage ||
      "In progress"
    );
  }, [application]);

  const helperText = useMemo(() => getStageHelperText(stage), [stage]);

  const handleUpload = useCallback(
    async (category: string, file: File) => {
      if (!id) return;
      setUploadState((prev) => ({
        ...prev,
        [category]: { uploading: true, progress: 0 },
      }));
      try {
        await uploadApplicationDocument(id, {
          documentCategory: category,
          file,
          onProgress: (progress) => {
            setUploadState((prev) => ({
              ...prev,
              [category]: { uploading: true, progress },
            }));
          },
        });
        await refreshDocuments();
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Upload failed. Please try again.");
      } finally {
        setUploadState((prev) => ({
          ...prev,
          [category]: { uploading: false, progress: 0 },
        }));
      }
    },
    [id, refreshDocuments]
  );

  if (loading) {
    return (
      <div style={layout.page}>
        <div style={layout.portalColumn}>
          <div style={components.form.sectionTitle}>Loading portal…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={layout.page}>
        <div style={layout.portalColumn}>
          <div style={components.form.sectionTitle}>Client portal unavailable</div>
          <p style={components.form.helperText}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <ApplicationPortalView
        businessName={businessName}
        stage={stage}
        helperText={helperText}
        documents={documents}
        onUpload={handleUpload}
        uploadState={uploadState}
      />
      <div style={{ height: tokens.spacing.xl }} />
    </div>
  );
}
