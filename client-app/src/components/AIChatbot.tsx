import { useState } from "react";
import html2canvas from "../utils/html2canvas";
import { apiRequest } from "../lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userInput = input;
    const userMessage: Message = { role: "user", content: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userInput }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "There was an error." },
      ]);
    }

    setLoading(false);
  }

  async function talkToHuman() {
    await apiRequest("/api/support/live", {
      method: "POST",
    });

    alert("A staff member will join shortly.");
  }

  async function reportIssue() {
    const description = prompt("Describe the issue:");

    if (!description) return;

    const screenshot = await html2canvas(document.body);
    const image = screenshot.toDataURL("image/png");

    await apiRequest("/api/support/report", {
      method: "POST",
      body: JSON.stringify({ description, screenshot: image }),
    });

    alert("Issue reported.");
  }

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="chat-actions">
        <button onClick={talkToHuman}>Talk to a Human</button>
        <button onClick={reportIssue}>Report an Issue</button>
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
