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
        className="bg-borealBlue text-white px-4 py-2 rounded-md shadow-sm mobile-full"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className="bg-white border shadow-xl rounded-lg p-4 w-full mobile-full md:w-80 h-[500px] flex flex-col mt-3">
          <div className="flex justify-between items-center mb-3">
            <strong>Support</strong>

            <div className="flex gap-2 text-sm">
              <button
                className={mode === "ai" ? "font-bold" : ""}
                onClick={() => setMode("ai")}
              >
                AI
              </button>
              <button
                className={mode === "human" ? "font-bold" : ""}
                onClick={() => setMode("human")}
              >
                Human
              </button>
              <button
                className={issueMode ? "font-bold text-red-600" : ""}
                onClick={() => {
                  setIssueMode(true);
                  setMode("ai");
                }}
              >
                Issue
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.map((m, i) => (
              <div key={i} className="p-2 rounded-md bg-gray-100 text-[14px] leading-tight">
                <div className="text-[12px] text-gray-600 mb-1">{m.from}</div>
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
            className="bg-borealBlue text-white p-2 rounded-md w-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
