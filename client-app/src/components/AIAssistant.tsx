import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;

    const content = input.trim();
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });

      const data = await res.json();
      setSessionId(data.sessionId ?? null);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "How else can I help?" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I hit a connection issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function talkToHuman() {
    if (!sessionId) return;

    try {
      await fetch("/api/ai/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } finally {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Transferring you to a specialist…" },
      ]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-5 py-3 text-white shadow-lg"
      >
        Maya
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex w-96 max-w-[95vw] flex-col rounded-lg bg-white shadow-2xl">
          <div className="flex justify-between border-b p-3 font-semibold">
            Maya — Boreal AI
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-2 overflow-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                {m.content}
              </div>
            ))}
            {loading && <div>Typing…</div>}
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
                className="flex-1 rounded bg-gray-800 py-2 text-xs text-white"
              >
                Talk to a Human
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
