import { useCallback, useEffect, useMemo, useState } from "react";
import { callBF, initClientVoice } from "@/services/voiceService";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ApplicationPortalView,
  getStageHelperText,
  getStatusBannerMessage,
  normalizeDocumentsResponse,
  formatStageLabel,
} from "@/portal/ApplicationPortalView";
import {
  loadUploadState,
  saveUploadState,
  type UploadStateEntry,
} from "@/portal/uploadState";
import {
  fetchApplication,
  fetchApplicationDocuments,
  uploadApplicationDocument,
} from "@/api/applications";
import { buildClientHistoryEvents } from "@/portal/clientHistory";
import { components, layout, tokens } from "@/styles";

export function ApplicationPortalPage() {
  const { id } = useParams();
  const location = useLocation();
  const submissionState = location.state as
    | { submitted?: boolean; duplicate?: boolean }
    | null;
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState(
    [] as ReturnType<typeof normalizeDocumentsResponse>
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [readOnlyMessage, setReadOnlyMessage] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<
    Record<string, UploadStateEntry>
  >({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const navigate = useNavigate();

  const uploadStorage = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage ?? null;
    } catch (error) {
      console.warn("Failed to access session storage:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const restored = loadUploadState(id, uploadStorage);
    setUploadState(restored.state);
    setUploadErrors(restored.errors);
  }, [id, uploadStorage]);

  useEffect(() => {
    if (!id) return;
    saveUploadState(id, uploadState, uploadErrors, uploadStorage);
  }, [id, uploadErrors, uploadState, uploadStorage]);

  useEffect(() => {
    if (!id) return;
    void initClientVoice(id);
  }, [id]);

  const refreshDocuments = useCallback(async () => {
    if (!id) return;
    const response = await fetchApplicationDocuments(id);
    setDocuments(normalizeDocumentsResponse(response));
  }, [id]);

  const loadPortal = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [applicationRes, documentsRes] = await Promise.all([
        fetchApplication(id),
        fetchApplicationDocuments(id),
      ]);
      const nextApplication = applicationRes as any;
      setApplication(nextApplication);
      setDocuments(normalizeDocumentsResponse(documentsRes));
      const stageValue =
        nextApplication?.stage ||
        nextApplication?.status ||
        nextApplication?.pipeline_stage ||
        "";
      const normalized = String(stageValue).toLowerCase();
      const isExpired =
        normalized.includes("expired") ||
        Boolean(nextApplication?.expired_at || nextApplication?.expiredAt);
      const isTerminal = ["approved", "declined", "rejected", "withdrawn", "funded", "closed"].some(
        (term) => normalized.includes(term)
      );
      setReadOnly(isExpired || isTerminal);
      setReadOnlyMessage(
        isExpired
          ? "This application has expired. Documents are view-only."
          : isTerminal
            ? "This application is in a final stage. Documents are view-only."
            : null
      );
    } catch (err: any) {
      console.error("Failed to load application portal:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate("/portal", { replace: true });
        return;
      }
      if (status === 404) {
        setError("We couldn’t find that application. Please check your link.");
      } else if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setError("Network connection lost. Reconnect and try again.");
      } else {
        setError("We couldn't load your application details.");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await loadPortal();
    })();
    return () => {
      active = false;
    };
  }, [loadPortal]);

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
  const statusMessage = useMemo(() => {
    return getStatusBannerMessage({
      stage,
      documents,
      documentReviewCompletedAt:
        application?.document_review_completed_at ??
        application?.documentReviewCompletedAt ??
        application?.documents_completed_at ??
        application?.ocr_completed_at ??
        null,
      financialReviewCompletedAt:
        application?.financial_review_completed_at ??
        application?.financialReviewCompletedAt ??
        application?.financials_completed_at ??
        application?.banking_completed_at ??
        null,
    });
  }, [application, stage, documents]);

  const historyEvents = useMemo(
    () =>
      buildClientHistoryEvents({
        status: { ...application, documents },
        stageLabel: formatStageLabel(stage),
      }),
    [application, documents, stage]
  );

  const submittedBanner = submissionState?.submitted ? (
    <div
      style={{
        ...components.card.base,
        marginBottom: tokens.spacing.lg,
        background: "rgba(59, 130, 246, 0.08)",
        borderColor: "rgba(59, 130, 246, 0.3)",
      }}
    >
      <div style={components.form.eyebrow}>Submitted</div>
      <div style={components.form.sectionTitle}>Next steps</div>
      <p style={components.form.helperText}>
        {submissionState?.duplicate
          ? "We located your existing submission. Your portal is ready below."
          : "We’ve received your application. Track progress and upload documents here."}
      </p>
    </div>
  ) : null;

  const handleUpload = useCallback(
    async (category: string, file: File) => {
      if (!id) return;
      if (readOnly) {
        setUploadErrors((prev) => ({
          ...prev,
          [category]: "Uploads are disabled for this application.",
        }));
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".docx"];
      const extension = file.name.toLowerCase();
      const validType =
        allowedTypes.includes(file.type) ||
        allowedExtensions.some((ext) => extension.endsWith(ext));
      if (!validType) {
        setUploadErrors((prev) => ({
          ...prev,
          [category]: "Unsupported file type. Allowed: PDF, PNG, JPEG, DOCX.",
        }));
        return;
      }
      setUploadState((prev) => ({
        ...prev,
        [category]: { uploading: true, progress: 0 },
      }));
      setUploadErrors((prev) => ({ ...prev, [category]: "" }));
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
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          setUploadErrors((prev) => ({
            ...prev,
            [category]: "Network connection lost. Reconnect and try again.",
          }));
        } else {
          setUploadErrors((prev) => ({
            ...prev,
            [category]: "Upload failed. Please try again.",
          }));
        }
      } finally {
        setUploadState((prev) => ({
          ...prev,
          [category]: { uploading: false, progress: 0 },
        }));
      }
    },
    [id, readOnly, refreshDocuments]
  );

  const handleCallUs = useCallback(async () => {
    setCallStatus("connecting");
    try {
      const call = await callBF();
      if (!call) {
        setCallStatus("ended");
        return;
      }
      setCallStatus("connected");
      call.on("disconnect", () => {
        setCallStatus("ended");
      });
    } catch (error) {
      console.error("Call failed:", error);
      setCallStatus("ended");
    }
  }, []);

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
          <button
            type="button"
            style={{
              marginTop: tokens.spacing.sm,
              ...components.buttons.base,
              ...components.buttons.secondary,
              width: "fit-content",
            }}
            onClick={() => loadPortal()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <div style={layout.portalColumn}>{submittedBanner}</div>
      <ApplicationPortalView
        businessName={businessName}
        stage={stage}
        statusMessage={statusMessage}
        helperText={helperText}
        documents={documents}
        onUpload={handleUpload}
        uploadState={uploadState}
        uploadErrors={uploadErrors}
        readOnly={readOnly}
        readOnlyMessage={readOnlyMessage}
        historyEvents={historyEvents}
        onCallUs={handleCallUs}
        callStatus={callStatus}
      />
      <div style={{ height: tokens.spacing.xl }} />
    </div>
  );
}
