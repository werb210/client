import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import api from "@/api";
import { trackEvent } from "../system/useAnalytics";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  context?: "client" | "website";
};

export default function AIChatWidget({ context = "client" }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const panelClassName = useMemo(
    () =>
      "fixed z-50 bg-white shadow-xl rounded border flex flex-col " +
      "bottom-0 right-0 left-0 h-[80vh] rounded-b-none sm:bottom-20 sm:right-6 sm:left-auto sm:h-[34rem] sm:w-96 sm:max-w-[calc(100vw-3rem)] sm:rounded",
    []
  );

  useEffect(() => {
    if (!open) return;
    trackEvent("chat_opened", { context });
  }, [context, open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [loading, messages]);

  async function send() {
    if (!input.trim()) return;
    const content = input.trim();
    const userMessage = { role: "user" as const, content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { message: content, context });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function talkToHuman() {
    trackEvent("chat_talk_to_human_clicked", { context });
    await api.post("/portal/chat", { context, messages });
    alert("A staff member will join shortly.");
  }

  async function captureScreenshot() {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL("image/png");
  }

  async function reportIssue() {
    const screenshot = await captureScreenshot();
    await api.post("/support/report", {
      context,
      message: input || "Issue reported from AI chat widget",
      screenshot,
    });
    alert("Issue reported.");
  }

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg"
      >
        AI Assistant
      </button>

      {open && (
        <div className={panelClassName}>
          <div className="p-3 border-b font-semibold flex justify-between">
            Boreal Assistant
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 p-3 overflow-auto space-y-2 text-sm">
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
              Ask AI
            </button>

            <div className="chat-actions flex flex-col sm:flex-row gap-2">
              <button onClick={talkToHuman} className="primary bg-green-600 text-white flex-1 py-2 rounded text-xs w-full">
                Talk to a Human
              </button>

              <button onClick={reportIssue} className="secondary bg-red-600 text-white flex-1 py-2 rounded text-xs w-full">
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
