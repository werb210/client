import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import {
  escalateToHuman,
  reportIssue,
  sendAiMessage,
  startAiSession,
} from "@/services/aiService";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || sessionId) return;

    void startAiSession({ context: "client" }).then((res) => {
      setSessionId(res.sessionId);
    });
  }, [open, sessionId]);

  async function send() {
    if (!input || !sessionId) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);

    const res = await sendAiMessage(sessionId, input);

    setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);

    setInput("");
    setLoading(false);
  }

  async function talkToHuman() {
    if (!sessionId) return;
    await escalateToHuman(sessionId);
    alert("Transferring you to a Boreal specialist.");
  }

  async function captureScreenshot() {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL("image/png");
  }

  async function handleReport() {
    if (!sessionId) return;
    const screenshot = await captureScreenshot();
    await reportIssue(sessionId, input || "Issue reported", screenshot);
    alert("Issue submitted.");
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 rounded-full bg-black px-4 py-3 text-white shadow-lg"
      >
        AI
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex w-96 flex-col rounded border bg-white shadow-xl">
          <div className="border-b p-3 font-semibold">Maya — Boreal AI</div>

          <div className="flex-1 space-y-2 overflow-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                {m.content}
              </div>
            ))}
            {loading && <div>Typing...</div>}
          </div>

          <div className="space-y-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border p-2"
              placeholder="Ask about financing..."
            />

            <button onClick={send} className="w-full rounded bg-black py-2 text-white">
              Ask Maya
            </button>

            <div className="flex gap-2">
              <button
                onClick={talkToHuman}
                className="flex-1 rounded bg-green-600 py-2 text-xs text-white"
              >
                Talk to a Human
              </button>

              <button
                onClick={handleReport}
                className="flex-1 rounded bg-red-600 py-2 text-xs text-white"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
