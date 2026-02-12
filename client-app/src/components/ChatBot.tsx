import { useMemo, useState } from "react";
import html2canvas from "../utils/html2canvas";
import { apiRequest } from "../lib/api";
import { trackEvent } from "../utils/analytics";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const sessionId = useMemo(() => `client_${Date.now()}`, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const userInput = input;
    const nextMessages = [...messages, { role: "user" as const, content: userInput }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput, sessionId }),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: (res as { reply: string }).reply }]);
    } catch (_err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "There was an error." }]);
    }

    setLoading(false);
  }

  async function talkToHuman() {
    trackEvent("talk_to_human_clicked_client");
    await apiRequest("/api/chat/escalate", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        transcript: messages,
        source: "client_app",
      }),
    });
    alert("A staff member will join shortly.");
  }

  async function reportIssue() {
    if (!issueDescription.trim()) return;
    const screenshot = await html2canvas(document.body);
    const screenshotBase64 = screenshot.toDataURL("image/png");

    await apiRequest("/api/support/report", {
      method: "POST",
      body: JSON.stringify({
        description: issueDescription,
        screenshotBase64,
        route: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    });

    trackEvent("client_issue_reported");
    setIssueDescription("");
    setShowIssueForm(false);
    alert("Issue reported.");
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[360px] max-w-[calc(100vw-2rem)]">
      {!open ? (
        <button
          className="w-full rounded-lg bg-slate-900 text-white py-3"
          onClick={() => {
            setOpen(true);
            trackEvent("client_chat_opened");
          }}
        >
          Open AI Chat
        </button>
      ) : (
        <div className="bg-white rounded-xl border shadow-xl overflow-hidden">
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2">
            <div>AI Assistant</div>
            <button onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="max-h-72 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm p-2 rounded ${m.role === "user" ? "bg-slate-100" : "bg-emerald-50"}`}>
                {m.content}
              </div>
            ))}
          </div>

          <div className="p-3 space-y-2 border-t">
            <div className="grid grid-cols-1 gap-2">
              <button className="w-full py-3 rounded-md bg-blue-600 text-white font-semibold" onClick={talkToHuman}>
                Talk to a Human
              </button>
              <button
                className="w-full py-3 rounded-md bg-amber-600 text-white font-semibold"
                onClick={() => setShowIssueForm((prev) => !prev)}
              >
                Report an Issue
              </button>
            </div>

            {showIssueForm && (
              <div className="space-y-2">
                <textarea
                  className="w-full border rounded-md p-2"
                  rows={3}
                  required
                  placeholder="Describe the issue"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
                <button className="w-full py-2 rounded-md bg-slate-800 text-white" onClick={reportIssue}>
                  Submit Issue
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-md p-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
              />
              <button className="px-4 py-2 bg-slate-900 text-white rounded-md" onClick={sendMessage} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
