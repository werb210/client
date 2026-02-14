import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  createAiSession,
  sendAiMessage,
  escalateToHuman,
  reportIssue,
} from "@/api/ai";

type Message = {
  role: "assistant" | "user";
  content: string;
};

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || sessionId) return;
    void initSession();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function initSession() {
    const session = await createAiSession("client");
    setSessionId(session.sessionId);
    setMessages([
      {
        role: "assistant",
        content: "Hi, I'm Maya — Boreal's AI assistant. How can I help today?",
      },
    ]);
  }

  async function handleSend() {
    if (!sessionId || !input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAiMessage(sessionId, userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    if (!sessionId) return;
    await escalateToHuman(sessionId);
    alert("Transferring you to a Boreal specialist…");
  }

  async function handleReport() {
    if (!sessionId) return;

    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL("image/png");

    await reportIssue(sessionId, input || "Issue reported from AI chat", screenshot);

    alert("Issue reported successfully.");
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg"
      >
        AI
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[90vw] bg-white shadow-xl rounded flex flex-col z-50">
          <div className="p-3 border-b font-semibold flex justify-between">
            Maya — Boreal AI
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 p-3 overflow-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                {m.content}
              </div>
            ))}
            {loading && <div>Typing…</div>}
          </div>

          <div className="p-3 border-t space-y-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 w-full"
              placeholder="Ask about financing..."
            />

            <button onClick={handleSend} className="bg-blue-600 text-white w-full py-2 rounded">
              Ask AI
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleEscalate}
                className="bg-green-600 text-white flex-1 py-2 rounded text-xs"
              >
                Talk to a Human
              </button>

              <button
                onClick={handleReport}
                className="bg-red-600 text-white flex-1 py-2 rounded text-xs"
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
