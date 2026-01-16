import { ClientAppAPI } from "../api/clientApp";
import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { OfflineStore } from "../state/offline";
import { useChatbot } from "../hooks/useChatbot";

export function StatusPage() {
  const token = new URLSearchParams(window.location.search).get("token");
  const [status, setStatus] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [issueMode, setIssueMode] = useState(false);
  const { send: sendAI } = useChatbot();

  useEffect(() => {
    if (!token) return;
    ClientAppAPI.status(token).then((res) => setStatus(res.data));
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

  const stages = [
    "Received",
    "In Review",
    "Documents Required",
    "Additional Steps Required",
    "Off to Lender",
    "Offer",
  ];

  const activeStage = useMemo(() => {
    const raw =
      status?.status ||
      status?.stage ||
      status?.pipelineStatus ||
      status?.state ||
      "";
    const normalized = String(raw).toLowerCase();
    if (normalized.includes("offer")) return "Offer";
    if (normalized.includes("lender")) return "Off to Lender";
    if (normalized.includes("additional")) return "Additional Steps Required";
    if (normalized.includes("document")) return "Documents Required";
    if (normalized.includes("review")) return "In Review";
    return "Received";
  }, [status]);

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
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <h1 className="text-xl font-semibold text-borealBlue">
              Client portal unavailable
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              We couldn’t find your application token. Use your magic link or
              start a new application.
            </p>
            <Button
              className="mt-4 w-full md:w-auto"
              onClick={() => (window.location.href = "/apply/step-1")}
            >
              Start new application
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-sm text-slate-500">Loading your status…</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Application status
              </div>
              <h1 className="text-2xl font-semibold text-borealBlue mt-2">
                {activeStage}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {stages.map((stage) => {
                const activeIndex = stages.indexOf(activeStage);
                const stageIndex = stages.indexOf(stage);
                const isActive = stageIndex <= activeIndex;
                return (
                  <div
                    key={stage}
                    className={`rounded-full px-4 py-2 text-xs font-semibold text-center ${
                      isActive
                        ? "bg-borealBlue text-white"
                        : "bg-borealLightBlue/50 text-borealBlue"
                    }`}
                  >
                    {stage}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <Card className="h-fit">
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-borealBlue">
                Actions
              </h2>
              <Button
                className="w-full"
                onClick={() => (window.location.href = "/apply/step-5")}
              >
                Upload required documents
              </Button>
              <Button
                className="w-full bg-white text-borealBlue border border-borealLightBlue"
                onClick={() => {
                  OfflineStore.clear();
                  window.location.href = "/apply/step-1";
                }}
              >
                New application
              </Button>
              <div className="text-xs text-slate-500">
                Personal net worth and collateral forms will appear here when
                available.
              </div>
            </div>
          </Card>

          <Card className="flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Messages
                </div>
                <h2 className="text-lg font-semibold text-borealBlue mt-1">
                  Conversation
                </h2>
              </div>
              <span className="text-xs text-slate-500">AI + staff support</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <button
                className={`px-3 py-1 rounded-full border ${
                  mode === "ai" && !issueMode
                    ? "bg-borealLightBlue text-borealBlue border-borealLightBlue"
                    : "border-slate-200 text-slate-500"
                }`}
                onClick={() => {
                  setMode("ai");
                  setIssueMode(false);
                }}
              >
                AI chat
              </button>
              <button
                className={`px-3 py-1 rounded-full border ${
                  mode === "human"
                    ? "bg-borealLightBlue text-borealBlue border-borealLightBlue"
                    : "border-slate-200 text-slate-500"
                }`}
                onClick={() => {
                  setMode("human");
                  setIssueMode(false);
                }}
              >
                Talk to a human
              </button>
              <button
                className={`px-3 py-1 rounded-full border ${
                  issueMode
                    ? "bg-borealLightBlue text-borealBlue border-borealLightBlue"
                    : "border-slate-200 text-slate-500"
                }`}
                onClick={() => {
                  setIssueMode(true);
                  setMode("ai");
                }}
              >
                Report an issue
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {messages.length === 0 && (
                <div className="text-sm text-slate-500">
                  No messages yet. Start the conversation any time.
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-borealGray text-[14px] leading-tight"
                >
                  <div className="text-[12px] text-slate-500 mb-1">{m.from}</div>
                  <div>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <Input
                placeholder="Type a message…"
                value={text}
                onChange={(e: any) => setText(e.target.value)}
              />
              <Button className="w-full" onClick={sendMessage}>
                Send message
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
