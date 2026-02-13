import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant" | "staff";
  content: string;
};

export default function AiChatShell() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!open) return;

    async function startSession() {
      const res = await fetch("/api/ai/session", { method: "POST" });
      const data = await res.json();
      setSessionId(data.sessionId);

      const ws = new WebSocket(
        `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api/ai/ws`
      );

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join_session", sessionId: data.sessionId }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);

        if (msg.type === "staff_joined") {
          setLiveMode(true);
        }
      };

      wsRef.current = ws;
    }

    startSession();

    return () => {
      wsRef.current?.close();
    };
  }, [open]);

  function send() {
    if (!input.trim() || !sessionId) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "user_message",
        sessionId,
        content: input,
      })
    );

    setInput("");
  }

  function escalate() {
    if (!sessionId) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "escalate",
        sessionId,
      })
    );
  }

  async function reportIssue() {
    if (!sessionId) return;

    const screenshot = await import("html2canvas").then((mod) =>
      mod.default(document.body)
    );

    await fetch("/api/support/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message: input || "Issue reported",
        screenshot: screenshot.toDataURL("image/png"),
      }),
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 px-4 py-3 text-white shadow-lg"
      >
        Maya
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[34rem] w-96 max-w-[95vw] flex-col rounded-lg bg-white shadow-2xl">
          <div className="flex justify-between border-b p-3 font-semibold">
            Maya – Boreal AI
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="flex-1 space-y-2 overflow-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <div className="text-xs opacity-50">{m.role}</div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border p-2"
              placeholder="Ask about financing..."
            />

            <button
              onClick={send}
              className="w-full rounded bg-blue-600 py-2 text-white"
            >
              Send
            </button>

            {!liveMode && (
              <button
                onClick={escalate}
                className="w-full rounded bg-green-600 py-2 text-xs text-white"
              >
                Talk to a Human
              </button>
            )}

            <button
              onClick={reportIssue}
              className="w-full rounded bg-red-600 py-2 text-xs text-white"
            >
              Report an Issue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
