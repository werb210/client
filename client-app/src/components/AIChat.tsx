import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    if (!input) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    setInput("");
  }

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={m.role}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="chat-actions">
        <button onClick={() => (window.location.href = "/contact")}>
          Talk to a Human
        </button>

        <button onClick={() => (window.location.href = "/report")}>Report an Issue</button>
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
