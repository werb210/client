import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AiApi, createAiSessionId, getPageContext, type AiMessage, type AiUserType } from "../../api/ai";
import { useStaffChatSocket } from "../../hooks/useStaffChatSocket";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { components, tokens } from "@/styles";
import { IssueModal } from "./IssueModal";

const HISTORY_STORAGE_KEY = "boreal_ai_chat_history";
const SESSION_STORAGE_KEY = "boreal_ai_chat_session";

type PersistedChat = {
  sessionId: string;
  messages: AiMessage[];
  escalated: boolean;
};

function readPersistedChat(): PersistedChat {
  if (typeof window === "undefined") {
    return { sessionId: createAiSessionId(), messages: [], escalated: false };
  }

  const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  const sessionId = window.localStorage.getItem(SESSION_STORAGE_KEY) || createAiSessionId();

  if (!stored) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return { sessionId, messages: [], escalated: false };
  }

  try {
    const parsed = JSON.parse(stored) as PersistedChat;
    return {
      sessionId: parsed.sessionId || sessionId,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      escalated: Boolean(parsed.escalated),
    };
  } catch {
    return { sessionId, messages: [], escalated: false };
  }
}

function savePersistedChat(data: PersistedChat) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
  window.localStorage.setItem(SESSION_STORAGE_KEY, data.sessionId);
}


export function getPanelLayoutStyles(isMobile: boolean) {
  return {
    inset: isMobile ? 0 : "auto 24px 92px auto",
    width: isMobile ? "100vw" : "min(420px, calc(100vw - 48px))",
    height: isMobile ? "100dvh" : "min(680px, calc(100vh - 140px))",
    borderRadius: isMobile ? 0 : tokens.radii.xl,
  };
}

type AiChatWidgetProps = {
  initialOpen?: boolean;
  forceMobile?: boolean;
};

export function AiChatWidget({ initialOpen = false, forceMobile }: AiChatWidgetProps) {
  const [{ sessionId, messages: persistedMessages, escalated: persistedEscalated }] = useState(readPersistedChat);
  const [messages, setMessages] = useState<AiMessage[]>(persistedMessages);
  const [open, setOpen] = useState(initialOpen);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEscalate, setShowEscalate] = useState(persistedEscalated);
  const [escalated, setEscalated] = useState(persistedEscalated);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userType, setUserType] = useState<AiUserType>("visitor");

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof forceMobile === "boolean") {
      setIsMobile(forceMobile);
      return;
    }

    const onResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceMobile]);

  useEffect(() => {
    const isClientSession = window.location.pathname.startsWith("/application") || window.location.pathname.startsWith("/status");
    setUserType(isClientSession ? "client" : "visitor");
  }, []);

  useEffect(() => {
    savePersistedChat({ sessionId, messages, escalated });
  }, [escalated, messages, sessionId]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const appendMessage = useCallback((message: AiMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const { state: staffSocketState } = useStaffChatSocket({
    sessionId,
    enabled: escalated,
    onStaffMessage: appendMessage,
  });

  const escalationText = useMemo(() => {
    if (!escalated) return "";
    if (staffSocketState === "connected") return "A team member will join shortly.";
    if (staffSocketState === "connecting") return "Connecting you to a team member...";
    return "Waiting for a team member to connect.";
  }, [escalated, staffSocketState]);

  async function sendMessage() {
    if (!text.trim() || escalated) return;

    const content = text.trim();
    setText("");
    appendMessage({ role: "user", content, timestamp: new Date().toISOString() });
    setTyping(true);

    try {
      const response = await AiApi.chat({
        sessionId,
        message: content,
        pageContext: getPageContext(),
        userType,
      });

      appendMessage({
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
      });

      if (response.escalate) {
        setShowEscalate(true);
      }
    } catch (error) {
      console.error("AI chat failed", error);
      appendMessage({
        role: "assistant",
        content: "I couldn't send that message right now. Please try again.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setTyping(false);
    }
  }

  async function escalateToHuman() {
    if (escalated) return;
    try {
      await AiApi.escalate(sessionId);
      setEscalated(true);
      appendMessage({
        role: "staff",
        content: "A team member will join shortly",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Escalation failed", error);
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: tokens.spacing.lg,
          bottom: tokens.spacing.lg,
          zIndex: 70,
        }}
      >
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="Open chat assistant"
          style={{
            ...components.chat.launcher,
            borderRadius: tokens.radii.pill,
            width: "56px",
            height: "56px",
            padding: 0,
          }}
        >
          💬
        </button>
      </div>

      {open ? (
        <div
          style={{
            position: "fixed",
            ...getPanelLayoutStyles(isMobile),
            background: tokens.colors.surface,
            boxShadow: tokens.shadows.card,
            zIndex: 75,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "ai-chat-enter 160ms ease-out",
          }}
        >
          <div
            style={{
              background: tokens.colors.primary,
              color: tokens.colors.surface,
              padding: tokens.spacing.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: tokens.spacing.sm,
            }}
          >
            <div style={{ display: "flex", gap: tokens.spacing.sm, alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>BF</div>
              <div>
                <div style={{ fontWeight: 600 }}>Boreal Marketplace Assistant</div>
                <div style={{ fontSize: "12px", opacity: 0.85 }}>
                  Ask about funding options, eligibility, or how it works.
                </div>
              </div>
            </div>
            <button style={components.buttons.ghost} onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div ref={messageContainerRef} style={{ flex: 1, overflowY: "auto", padding: tokens.spacing.md }}>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              {messages.map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  style={{
                    ...components.chat.bubble,
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "92%",
                    background:
                      message.role === "user"
                        ? tokens.colors.primaryLight
                        : message.role === "staff"
                        ? "#fde7e7"
                        : tokens.colors.background,
                  }}
                >
                  <div style={components.chat.bubbleMeta}>{message.role}</div>
                  <div>{message.content}</div>
                </div>
              ))}
              {typing ? (
                <div style={components.chat.bubble}>
                  <div style={components.chat.bubbleMeta}>assistant</div>
                  <div>Typing…</div>
                </div>
              ) : null}
            </div>
          </div>

          {escalationText ? <p style={{ ...components.form.helperText, padding: `0 ${tokens.spacing.md}` }}>{escalationText}</p> : null}

          <div style={{ padding: tokens.spacing.md, paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom) + 16px)" : tokens.spacing.md }}>
            <div style={{ display: "flex", gap: tokens.spacing.xs, marginBottom: tokens.spacing.sm, flexWrap: "wrap" }}>
              {showEscalate && !escalated ? (
                <Button onClick={() => void escalateToHuman()}>Talk to a Human</Button>
              ) : null}
              <Button variant="secondary" onClick={() => setIssueModalOpen(true)}>
                Report an Issue
              </Button>
            </div>
            <div style={{ display: "flex", gap: tokens.spacing.sm, alignItems: "center" }}>
              <Input
                value={text}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={escalated ? "AI is paused while a team member joins." : "Type your question"}
                disabled={escalated}
                aria-label="Chat message"
              />
              <Button onClick={() => void sendMessage()} disabled={!text.trim() || escalated || typing}>
                Send
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <IssueModal open={issueModalOpen} onClose={() => setIssueModalOpen(false)} />
    </>
  );
}

export default AiChatWidget;
