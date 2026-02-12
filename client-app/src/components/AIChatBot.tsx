import { useState } from "react";
import html2canvas from "html2canvas";

type Message = {
  role: "bot" | "user";
  text: string;
};

export function AIChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi — I can answer questions about Boreal’s marketplace, products, and how to apply.",
    },
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);

    setInput("");
  }

  async function talkToHuman() {
    await fetch("/api/support/live", { method: "POST" });
    alert("A staff member has been notified.");
  }

  async function reportIssue() {
    const description = prompt("What were you doing when the issue occurred?");
    if (!description) return;

    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL("image/png");

    await fetch("/api/support/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        screenshot,
      }),
    });

    alert("Issue reported.");
  }

  return (
    <div className="chatbot">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={m.role}>
            {m.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about funding..."
      />

      <button onClick={sendMessage}>Send</button>

      <div className="chat-actions">
        <button onClick={talkToHuman} className="human-btn">
          Talk to a Human
        </button>

        <button onClick={reportIssue} className="report-btn">
          Report an Issue
        </button>
      </div>
    </div>
  );
}
