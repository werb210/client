import { ClientAppAPI } from "../api/clientApp";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button, PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useChatbot } from "../hooks/useChatbot";
import { ClientProfileStore } from "../state/clientProfiles";
import {
  createPipelinePoller,
  getPipelineStage,
} from "../realtime/pipeline";
import { useDocumentRejectionNotifications } from "../portal/useDocumentRejectionNotifications";
import { formatDocumentLabel } from "../wizard/requirements";
import {
  LinkedApplicationStore,
  createLinkedApplication,
} from "../applications/linkedApplications";
import { DocumentUploadList } from "../components/DocumentUploadList";
import { StatusTimeline } from "../components/StatusTimeline";
import { PIPELINE_STAGE_LABELS } from "../portal/timeline";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useForegroundRefresh } from "../hooks/useForegroundRefresh";
import { logout } from "../auth/logout";
import { loadChatHistory, saveChatHistory } from "../state/chatHistory";
import { syncRequiredDocumentsFromStatus } from "../documents/requiredDocumentsCache";
import { OfflineStore } from "../state/offline";
import { extractApplicationFromStatus } from "../applications/resume";
import {
  createSubmissionStatusPoller,
  loadSubmissionStatusCache,
  saveSubmissionStatusCache,
  type SubmissionStatusSnapshot,
} from "../services/applicationStatus";
import {
  getSubmissionFailureBanner,
  getSubmissionStageBanner,
} from "../portal/submissionMessaging";
import { components, layout, tokens } from "@/styles";

export function StatusPage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>(() =>
    loadChatHistory(new URLSearchParams(window.location.search).get("token"))
  );
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [issueMode, setIssueMode] = useState(false);
  const [rejectionNotice, setRejectionNotice] = useState<{
    documents: string[];
  } | null>(null);
  const [linkedAppError, setLinkedAppError] = useState<string | null>(null);
  const [linkedAppBusy, setLinkedAppBusy] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<
    SubmissionStatusSnapshot | null
  >(() => (token ? loadSubmissionStatusCache(token) : null));
  const { send: sendAI } = useChatbot();
  const navigate = useNavigate();

  const refreshStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await ClientAppAPI.status(token);
      setStatus(res.data);
    } catch (error) {
      console.error("Status refresh failed:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!ClientProfileStore.hasPortalSession(token)) {
      navigate("/portal", { replace: true });
      return;
    }
    refreshStatus();
  }, [navigate, refreshStatus, token]);

  useEffect(() => {
    if (!token) return;
    setSubmissionStatus(loadSubmissionStatusCache(token));
  }, [token]);

  const refreshMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await ClientAppAPI.getMessages(token);
      setMessages(res.data);
      saveChatHistory(token, res.data);
    } catch (error) {
      console.error("Message refresh failed:", error);
    }
  }, [token]);

  useEffect(() => {
    setMessages(loadChatHistory(token));
  }, [token]);

  useEffect(() => {
    refreshMessages();
    const id = setInterval(refreshMessages, 5000);
    return () => clearInterval(id);
  }, [refreshMessages]);

  useEffect(() => {
    if (!token) return;
    const stop = createPipelinePoller({
      token,
      fetchStatus: async (activeToken) => {
        const res = await ClientAppAPI.status(activeToken);
        return res.data;
      },
      onUpdate: (next) => {
        setStatus(next);
      },
      onError: (error) => {
        console.error("Status refresh failed:", error);
      },
    });
    return () => stop();
  }, [token]);

  useForegroundRefresh(() => {
    refreshMessages();
    refreshStatus();
  }, [refreshMessages, refreshStatus]);

  const applicationId = useMemo(() => {
    return (
      status?.applicationId ||
      status?.application?.applicationId ||
      status?.application?.id ||
      status?.id ||
      null
    );
  }, [status]);

  useEffect(() => {
    if (!token || !applicationId) return;
    const stop = createSubmissionStatusPoller({
      applicationId,
      onUpdate: (snapshot) => {
        setSubmissionStatus(snapshot);
        saveSubmissionStatusCache(token, snapshot);
      },
      onError: (error) => {
        console.error("Submission status refresh failed:", error);
      },
    });
    return () => stop();
  }, [applicationId, token]);

  const stages = PIPELINE_STAGE_LABELS;

  const activeStage = useMemo(
    () => getPipelineStage(status, submissionStatus),
    [status, submissionStatus]
  );
  const submissionUpdatedLabel = useMemo(() => {
    if (!submissionStatus?.updatedAt) return null;
    const parsed = new Date(submissionStatus.updatedAt);
    if (Number.isNaN(parsed.getTime())) return submissionStatus.updatedAt;
    return parsed.toLocaleString();
  }, [submissionStatus]);
  const statusBanner = useMemo(
    () => getSubmissionStageBanner(activeStage),
    [activeStage]
  );
  const statusBannerLink = useMemo(() => {
    if (activeStage !== "Offer Available" || !applicationId) return null;
    return `/application/${applicationId}/offers`;
  }, [activeStage, applicationId]);
  const failureBanner = useMemo(() => {
    if (submissionStatus?.status !== "failed") return null;
    return getSubmissionFailureBanner(submissionStatus.rawStatus || undefined);
  }, [submissionStatus]);

  const phone = useMemo(() => {
    return (
      status?.application?.financialProfile?.phone ||
      status?.financialProfile?.phone ||
      ClientProfileStore.getLastUsedPhone()
    );
  }, [status]);
  const linkedTokens = useMemo(() => {
    if (!phone) return [];
    return ClientProfileStore.listTokens(phone);
  }, [phone]);

  useEffect(() => {
    if (!token || !status) return;
    syncRequiredDocumentsFromStatus(status);
    if (phone) {
      ClientProfileStore.upsertProfile(phone, token);
    }
    const linkedTokens =
      status?.linkedApplicationTokens ||
      status?.linked_application_tokens ||
      [];
    if (Array.isArray(linkedTokens) && linkedTokens.length > 0) {
      LinkedApplicationStore.sync(token, linkedTokens);
      if (phone) {
        linkedTokens.forEach((linkedToken: string) => {
          ClientProfileStore.upsertProfile(phone, linkedToken);
        });
      }
    }
  }, [phone, status, token]);

  useDocumentRejectionNotifications({
    token,
    documents: status?.documents,
    onNotify: (notification) => {
      setRejectionNotice({ documents: notification.documents });
    },
  });

  async function startLinkedApplication() {
    if (!token) return;
    const financialProfile =
      status?.application?.financialProfile || status?.financialProfile;
    if (!financialProfile) {
      setLinkedAppError(
        "We couldn't find your financial profile to start a linked application."
      );
      return;
    }
    setLinkedAppBusy(true);
    setLinkedAppError(null);
    try {
      const newToken = await createLinkedApplication(
        token,
        financialProfile,
        "client_initiated"
      );
      if (phone) {
        ClientProfileStore.upsertProfile(phone, newToken);
      }
      const res = await ClientAppAPI.status(newToken);
      const hydrated = extractApplicationFromStatus(res?.data || {}, newToken);
      OfflineStore.save({
        ...hydrated,
        applicationToken: newToken,
        currentStep: 2,
      });
      navigate("/apply/step-2");
    } catch (error) {
      console.error("Failed to create linked application:", error);
      setLinkedAppError("Unable to start a linked application. Please try again.");
    } finally {
      setLinkedAppBusy(false);
    }
  }

  function scrollToMessages() {
    document
      .getElementById("portal-messages")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  async function sendMessage() {
    if (!text.trim() || !token) return;

    if (issueMode) {
      await ClientAppAPI.sendMessage(token, "[ISSUE REPORTED] " + text);
      setIssueMode(false);
    } else if (mode === "human") {
      await ClientAppAPI.sendMessage(token, text);
    } else {
      const aiReply = await sendAI(text);
      await ClientAppAPI.sendMessage(token, aiReply);
    }

    setText("");
    refreshMessages();
  }

  if (!token) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <div style={layout.stackTight}>
              <h1 style={components.form.sectionTitle}>Client portal unavailable</h1>
              <p style={components.form.subtitle}>
                We couldn’t find your application token. Use your magic link or
                start a new application.
              </p>
              <PrimaryButton
                onClick={() => navigate("/apply/step-1")}
                style={{ width: "100%" }}
              >
                Start new application
              </PrimaryButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (token && !ClientProfileStore.hasPortalSession(token)) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <div style={layout.stackTight}>
              <h1 style={components.form.sectionTitle}>Session expired</h1>
              <p style={components.form.subtitle}>
                Please verify your phone number again to access the portal.
              </p>
              <PrimaryButton
                style={{ width: "100%" }}
                onClick={() => navigate("/portal", { replace: true })}
              >
                Verify phone
              </PrimaryButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <EmptyState>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: tokens.spacing.sm,
                }}
              >
                <Spinner />
                <span>Loading your status…</span>
              </div>
            </EmptyState>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <div style={layout.portalColumn}>
        <Card>
          <div style={layout.stackTight}>
            <div style={layout.stackTight}>
              <div style={components.form.eyebrow}>Application status</div>
              <h1 style={components.form.title}>{activeStage}</h1>
              {submissionUpdatedLabel && (
                <div
                  style={components.form.helperText}
                  title={`Updated ${submissionUpdatedLabel}`}
                >
                  Updated {submissionUpdatedLabel}
                </div>
              )}
            </div>

            <StatusTimeline stages={stages} activeStage={activeStage} />
          </div>
        </Card>

        {failureBanner && (
          <Card
            style={{
              border: `1px solid rgba(245, 158, 11, 0.35)`,
              background: "rgba(245, 158, 11, 0.1)",
            }}
          >
            <div style={layout.stackTight}>
              <div style={{ fontWeight: 600, color: tokens.colors.warning }}>
                {failureBanner.title}
              </div>
              <div style={components.form.subtitle}>{failureBanner.message}</div>
              <PrimaryButton
                style={{ width: "100%" }}
                onClick={() => {
                  setMode("human");
                  setIssueMode(false);
                  scrollToMessages();
                }}
              >
                {failureBanner.cta}
              </PrimaryButton>
            </div>
          </Card>
        )}

        {statusBanner && !failureBanner && (
          <Card
            style={{
              border: `1px solid rgba(59, 130, 246, 0.2)`,
              background: "rgba(59, 130, 246, 0.08)",
            }}
          >
            <div style={layout.stackTight}>
              <div style={{ fontWeight: 600 }}>{statusBanner.title}</div>
              <div style={components.form.subtitle}>{statusBanner.message}</div>
              {statusBanner.cta && statusBannerLink ? (
                <PrimaryButton
                  style={{ width: "100%" }}
                  onClick={() => navigate(statusBannerLink)}
                >
                  {statusBanner.cta}
                </PrimaryButton>
              ) : null}
            </div>
          </Card>
        )}

        {rejectionNotice && (
          <Card
            style={{
              border: `1px solid rgba(245, 158, 11, 0.35)`,
              background: "rgba(245, 158, 11, 0.1)",
            }}
          >
            <div style={layout.stackTight}>
              <div style={{ fontWeight: 600, color: tokens.colors.warning }}>
                Action needed: documents rejected
              </div>
              <div style={components.form.subtitle}>
                We sent a single SMS and email summary covering the rejected
                files below. Please re-upload them to keep your application
                moving.
              </div>
              <DocumentUploadList
                documents={rejectionNotice.documents.map(formatDocumentLabel)}
              />
              <PrimaryButton
                style={{ width: "100%" }}
                onClick={() => navigate("/apply/step-5")}
              >
                Re-upload documents
              </PrimaryButton>
            </div>
          </Card>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: tokens.spacing.lg,
          }}
        >
          <div style={{ display: "grid", gap: tokens.spacing.lg }}>
            <Card style={{ height: "fit-content" }}>
              <div style={layout.stackTight}>
                <h2 style={components.form.sectionTitle}>Actions</h2>
                <PrimaryButton
                  style={{ width: "100%" }}
                  onClick={() => navigate("/apply/step-5")}
                >
                  Upload required documents
                </PrimaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={() => navigate("/resume")}
                >
                  View application
                </SecondaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={startLinkedApplication}
                  disabled={linkedAppBusy}
                  loading={linkedAppBusy}
                >
                  Start new linked application
                </SecondaryButton>
                {linkedAppError && (
                  <div style={components.form.errorText}>{linkedAppError}</div>
                )}
                <SecondaryButton style={{ width: "100%" }} onClick={scrollToMessages}>
                  Messages
                </SecondaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={async () => {
                    await logout({ redirectTo: "/apply/step-1" });
                  }}
                >
                  New application
                </SecondaryButton>
                {linkedTokens.length > 0 && (
                  <div style={layout.stackTight}>
                    <div style={components.form.eyebrow}>Your applications</div>
                    {linkedTokens.map((linkedToken, index) => {
                      const isCurrent = linkedToken === token;
                      return (
                        <Button
                          key={linkedToken}
                          variant={isCurrent ? "primary" : "secondary"}
                          style={{ width: "100%" }}
                          onClick={() => {
                            ClientProfileStore.markPortalVerified(linkedToken);
                            navigate(`/status?token=${linkedToken}`);
                          }}
                        >
                          {isCurrent
                            ? `Application ${index + 1} (Current)`
                            : `Application ${index + 1}`}
                        </Button>
                      );
                    })}
                  </div>
                )}
                <div style={components.form.helperText}>
                  Personal net worth and collateral forms will appear here when
                  available.
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gap: tokens.spacing.lg }}>
            <Card>
              <div style={layout.stackTight}>
                <h2 style={components.form.sectionTitle}>Messages</h2>
                <div
                  style={{
                    display: "flex",
                    gap: tokens.spacing.sm,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant={mode === "ai" && !issueMode ? "primary" : "secondary"}
                    onClick={() => {
                      setMode("ai");
                      setIssueMode(false);
                    }}
                  >
                    AI chat
                  </Button>
                  <Button
                    variant={mode === "human" ? "primary" : "secondary"}
                    onClick={() => {
                      setMode("human");
                      setIssueMode(false);
                    }}
                  >
                    Talk to a human
                  </Button>
                  <Button
                    variant={issueMode ? "primary" : "secondary"}
                    onClick={() => {
                      setIssueMode(true);
                      setMode("ai");
                    }}
                  >
                    Report an issue
                  </Button>
                </div>

                <div
                  id="portal-messages"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: tokens.spacing.sm,
                    maxHeight: "360px",
                    overflowY: "auto",
                  }}
                >
                  {messages.map((m, i) => (
                    <div key={i} style={components.chat.bubble}>
                      <div style={components.chat.bubbleMeta}>{m.from}</div>
                      <div>{m.text}</div>
                    </div>
                  ))}
                </div>

                <Input
                  placeholder="Type a message…"
                  value={text}
                  onChange={(e: any) => setText(e.target.value)}
                />
                <PrimaryButton onClick={sendMessage}>Send</PrimaryButton>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
