import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import {
  createAiSession,
  sendAiMessage,
  escalateAi,
  reportIssue,
} from "@/api/ai";
import type { AiMessage, AiSession } from "@/types/ai";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AiSession | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) return;

    void createAiSession("client").then((data) => {
      setSession({
        sessionId: data.sessionId,
        escalated: Boolean(data.escalated),
        takeover: Boolean(data.takeover),
      });
    });
  }, [session]);

  useEffect(() => {
    if (!session?.takeover) return;

    setMessages((prev) => {
      const alreadyNotified = prev.some(
        (message) =>
          message.role === "staff" &&
          message.content === "A Boreal specialist has joined the conversation.",
      );

      if (alreadyNotified) return prev;

      return [
        ...prev,
        {
          role: "staff",
          content: "A Boreal specialist has joined the conversation.",
        },
      ];
    });
  }, [session?.takeover]);

  async function send() {
    if (!input.trim() || !session?.sessionId || session.takeover) return;

    const userMessage: AiMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAiMessage(session.sessionId, userMessage.content);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
        },
      ]);

      if (res.takeover) {
        setSession((prev) => (prev ? { ...prev, takeover: true } : prev));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    if (!session?.sessionId || session.escalated) return;

    await escalateAi(session.sessionId);

    setSession((prev) => (prev ? { ...prev, escalated: true } : prev));
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Transferring you to a Boreal specialist..." },
    ]);
  }

  async function handleReport() {
    if (!session?.sessionId) return;

    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL("image/png");

    await reportIssue(session.sessionId, input || "Issue reported", screenshot);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Issue submitted successfully." },
    ]);
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
              <div key={i}>
                <strong>{m.role}:</strong> {m.content}
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
              disabled={session?.takeover}
            />

            <button onClick={send} className="w-full rounded bg-black py-2 text-white" disabled={session?.takeover}>
              Ask Maya
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleEscalate}
                className="flex-1 rounded bg-green-600 py-2 text-xs text-white"
                disabled={session?.escalated}
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
