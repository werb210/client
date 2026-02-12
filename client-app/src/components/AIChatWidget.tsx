import { useState } from "react";
import api from "@/api";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { message: input });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function escalate() {
    await api.post("/ai/escalate", { messages });
    alert("A staff member will join shortly.");
  }

  async function reportIssue() {
    const canvas = await import("html2canvas").then((mod) => mod.default(document.body));
    const image = canvas.toDataURL("image/png");
    await api.post("/report-issue", {
      screenshot: image,
      url: window.location.href,
    });
    alert("Issue reported.");
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg"
      >
        AI Assistant
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 h-[34rem] w-96 max-w-[calc(100vw-3rem)] bg-white shadow-xl rounded flex flex-col border">
          <div className="p-3 border-b font-semibold flex justify-between">
            Boreal Assistant
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="flex-1 p-3 overflow-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={m.role === "user" ? "text-right" : ""}>
                {m.content}
              </div>
            ))}
            {loading && <div>Typing...</div>}
          </div>

          <div className="p-3 border-t space-y-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border p-2 w-full"
              placeholder="Ask about financing..."
            />
            <button onClick={send} className="bg-blue-600 text-white w-full py-2 rounded">
              Send
            </button>

            <div className="flex gap-2">
              <button onClick={escalate} className="bg-green-600 text-white flex-1 py-2 rounded text-xs">
                Talk to a Human
              </button>

              <button onClick={reportIssue} className="bg-red-600 text-white flex-1 py-2 rounded text-xs">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
