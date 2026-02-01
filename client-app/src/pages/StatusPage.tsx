import { ClientAppAPI } from "../api/clientApp";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button, PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { OfflineStore } from "../state/offline";
import { useChatbot } from "../hooks/useChatbot";
import { ClientProfileStore } from "../state/clientProfiles";
import {
  createPipelinePoller,
  getPipelineStage,
} from "../realtime/pipeline";
import { useDocumentRejectionNotifications } from "../portal/useDocumentRejectionNotifications";
import { formatDocumentLabel } from "../wizard/requirements";
import { LinkedApplicationStore } from "../applications/linkedApplications";
import { DocumentUploadList } from "../components/DocumentUploadList";
import { StatusTimeline } from "../components/StatusTimeline";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { components, layout, tokens } from "@/styles";

export function StatusPage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [issueMode, setIssueMode] = useState(false);
  const [rejectionNotice, setRejectionNotice] = useState<{
    documents: string[];
  } | null>(null);
  const { send: sendAI } = useChatbot();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    if (!ClientProfileStore.hasPortalSession(token)) {
      navigate("/portal", { replace: true });
      return;
    }
    ClientAppAPI.status(token).then((res) => setStatus(res.data));
  }, [navigate, token]);

  useEffect(() => {
    if (!token) return;
    const handleUnload = () => {
      ClientProfileStore.clearPortalSessions();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      ClientProfileStore.clearPortalSessions();
    };
  }, [token]);

  async function refreshMessages() {
    if (!token) return;
    const res = await ClientAppAPI.getMessages(token);
    setMessages(res.data);
  }

  useEffect(() => {
    refreshMessages();
    const id = setInterval(refreshMessages, 5000);
    return () => clearInterval(id);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const stop = createPipelinePoller({
      token,
      fetchStatus: async (activeToken) => {
        const res = await ClientAppAPI.status(activeToken);
        return res.data;
      },
      onUpdate: (next) => setStatus(next),
      onError: (error) => {
        console.error("Status refresh failed:", error);
      },
    });
    return () => stop();
  }, [token]);

  const stages = [
    "Received",
    "In Review",
    "Documents Required",
    "Additional Steps Required",
    "Off to Lender",
    "Offer",
  ];

  const activeStage = useMemo(() => getPipelineStage(status), [status]);

  useEffect(() => {
    if (!token || !status) return;
    const linkedTokens =
      status?.linkedApplicationTokens ||
      status?.linked_application_tokens ||
      [];
    if (Array.isArray(linkedTokens) && linkedTokens.length > 0) {
      LinkedApplicationStore.sync(token, linkedTokens);
    }
  }, [status, token]);

  useDocumentRejectionNotifications({
    token,
    documents: status?.documents,
    onNotify: (notification) => {
      setRejectionNotice({ documents: notification.documents });
    },
  });

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
                onClick={() => (window.location.href = "/apply/step-1")}
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
    return null;
  }

  if (!status) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <EmptyState>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tokens.spacing.sm }}>
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
            </div>

            <StatusTimeline stages={stages} activeStage={activeStage} />
          </div>
        </Card>

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
                onClick={() => (window.location.href = "/apply/step-5")}
              >
                Re-upload documents
              </PrimaryButton>
            </div>
          </Card>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: tokens.spacing.lg,
          }}
        >
          <div style={{ display: "grid", gap: tokens.spacing.lg }}>
            <Card style={{ height: "fit-content" }}>
              <div style={layout.stackTight}>
                <h2 style={components.form.sectionTitle}>Actions</h2>
                <PrimaryButton
                  style={{ width: "100%" }}
                  onClick={() => (window.location.href = "/apply/step-5")}
                >
                  Upload required documents
                </PrimaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={() => (window.location.href = "/resume")}
                >
                  View application
                </SecondaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={() =>
                    document
                      .getElementById("portal-messages")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Messages
                </SecondaryButton>
                <SecondaryButton
                  style={{ width: "100%" }}
                  onClick={() => {
                    OfflineStore.clear();
                    window.location.href = "/apply/step-1";
                  }}
                >
                  New application
                </SecondaryButton>
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
