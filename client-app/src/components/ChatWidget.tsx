import { useState, useEffect } from "react";
import { useChatbot } from "../hooks/useChatbot";
import { ClientAppAPI } from "../api/clientApp";
import { OfflineStore } from "../state/offline";
import { Input } from "./ui/Input";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [issueMode, setIssueMode] = useState(false);

  const { send: sendAI } = useChatbot();

  const cached = OfflineStore.load();
  const token = cached?.applicationToken;

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

  async function sendMessage() {
    if (!text.trim()) return;

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

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-full md:w-auto">
      <button
        className="bg-borealBlue text-white px-5 py-3 rounded-full shadow-sm mobile-full"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close chat" : "Chat"}
      </button>

      {open && (
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-full mobile-full md:w-80 h-[520px] flex flex-col mt-3">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between">
              <strong className="text-borealBlue">Boreal Assist</strong>
              <span className="text-xs text-slate-500">24/7 chat support</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
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
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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

          <Input
            className="mb-2"
            placeholder="Type a message…"
            value={text}
            onChange={(e: any) => setText(e.target.value)}
          />

          <button
            className="bg-borealBlue text-white p-2.5 rounded-full w-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
