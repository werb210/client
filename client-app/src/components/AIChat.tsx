import { useState } from "react";
import html2canvas from "html2canvas";
import { track } from "../utils/track";

export default function AIChat() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, source: "client_app" }),
      });

      const data = await res.json();
      setResponse(data.response || "No response.");
      track("ai_chat_message_sent", { hasResponse: Boolean(data.response) });
    } catch (err) {
      console.error(err);
      setResponse("AI is temporarily unavailable.");
      track("ai_chat_message_failed");
    }

    setLoading(false);
  }

  async function escalate() {
    await fetch("/api/support/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "client_app",
        sessionId: Date.now().toString(),
      }),
    });

    track("ai_chat_escalated");
    alert("A staff member has been notified.");
  }

  async function reportIssue() {
    const description = prompt("What were you doing and what went wrong?");
    if (!description) return;

    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL("image/png");

    await fetch("/api/support/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "client_app",
        description,
        screenshot,
      }),
    });

    track("ai_chat_issue_reported");
    alert("Issue reported successfully.");
  }

  return (
    <div className="ai-chat">
      <textarea
        placeholder="Ask about products, eligibility, or your application..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      <div style={{ marginTop: 10 }}>{response}</div>

      <div style={{ marginTop: 20 }}>
        <button onClick={escalate}>Talk to a Human</button>
        <button onClick={reportIssue}>Report an Issue</button>
      </div>
    </div>
  );
}
