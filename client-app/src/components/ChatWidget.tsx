import { useCallback, useEffect, useState } from "react";
import { useChatbot } from "../hooks/useChatbot";
import { useForegroundRefresh } from "../hooks/useForegroundRefresh";
import { ClientAppAPI } from "../api/clientApp";
import { OfflineStore } from "../state/offline";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { components, tokens } from "@/styles";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [issueMode, setIssueMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { send: sendAI } = useChatbot();

  const cached = OfflineStore.load();
  const token = cached?.applicationToken;

  const refreshMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await ClientAppAPI.getMessages(token);
      setMessages(res.data);
    } catch (error) {
      console.error("Chat refresh failed:", error);
    }
  }, [token]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setIsMobile(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    refreshMessages();
    const id = setInterval(refreshMessages, 5000);
    return () => clearInterval(id);
  }, [refreshMessages]);

  useForegroundRefresh(() => {
    refreshMessages();
  }, [refreshMessages]);

  async function sendMessage() {
    if (!text.trim()) return;

    try {
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
    } catch (error) {
      console.error("Chat send failed:", error);
    }
  }

  const containerStyle = {
    position: "fixed" as const,
    bottom: tokens.spacing.lg,
    right: tokens.spacing.lg,
    zIndex: 50,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end" as const,
    gap: tokens.spacing.sm,
    width: isMobile ? "100%" : "auto",
  };

  return (
    <div style={containerStyle}>
      <button
        style={{
          ...components.chat.launcher,
          width: isMobile ? "48px" : "auto",
          height: isMobile ? "48px" : "auto",
          borderRadius: isMobile ? tokens.radii.pill : tokens.radii.pill,
          padding: isMobile ? 0 : "12px 20px",
        }}
        onClick={() => setOpen(!open)}
        aria-label="Toggle chat"
      >
        {isMobile ? "💬" : open ? "Close chat" : "Chat"}
      </button>

      {open && (
        <div
          style={{
            ...components.chat.panel,
            width: isMobile ? "100%" : components.chat.panel.width,
            height: isMobile ? "70vh" : components.chat.panel.height,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <strong style={{ color: tokens.colors.primary }}>Boreal Assist</strong>
              <span style={components.form.helperText}>24/7 chat support</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.xs }}>
              {[
                { key: "ai", label: "AI chat", active: mode === "ai" && !issueMode },
                { key: "human", label: "Talk to a human", active: mode === "human" },
                { key: "issue", label: "Report an issue", active: issueMode },
              ].map((tag) => (
                <button
                  key={tag.key}
                  style={{
                    ...components.chat.tag,
                    ...(tag.active ? components.chat.tagActive : null),
                  }}
                  onClick={() => {
                    if (tag.key === "issue") {
                      setIssueMode(true);
                      setMode("ai");
                    } else {
                      setMode(tag.key as "ai" | "human");
                      setIssueMode(false);
                    }
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              {messages.map((m, i) => (
                <div key={i} style={components.chat.bubble}>
                  <div style={components.chat.bubbleMeta}>{m.from}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
          </div>

          <Input
            placeholder="Type a message…"
            value={text}
            onChange={(e: any) => setText(e.target.value)}
          />

          <Button onClick={sendMessage}>Send</Button>
        </div>
      )}
    </div>
  );
}
