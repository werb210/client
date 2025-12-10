import { useState, useEffect } from "react";
import { useChatbot } from "../hooks/useChatbot";
import { ClientAppAPI } from "../api/clientApp";
import { OfflineStore } from "../state/offline";

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
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      <button
        className="bg-borealBlue text-white p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close" : "Chat"}
      </button>

      {open && (
        <div className="bg-white border shadow-lg p-3 mt-2 w-80 h-96 flex flex-col">
          <div className="flex justify-between mb-2">
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

          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map((m, i) => (
              <div key={i} className="mb-2">
                <b>{m.from}:</b> {m.text}
              </div>
            ))}
          </div>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            className="bg-borealBlue text-white p-2 w-full"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
