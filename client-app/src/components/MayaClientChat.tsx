import { useMemo, useState } from "react";

type MayaResponse = {
  reply?: string;
  requiresConfirmation?: boolean;
  action?: string;
  escalated?: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SESSION_STORAGE_KEY = "mayaSession";

function getSessionId() {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const nextId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(SESSION_STORAGE_KEY, nextId);
  return nextId;
}

export default function MayaClientChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const sessionId = useMemo(() => getSessionId(), []);

  async function sendMessage(confirmed = false) {
    if (!input.trim() && !confirmed) return;

    const nextMessage = input;
    if (!confirmed) {
      const userMsg: ChatMessage = { role: "user", content: nextMessage };
      setMessages((prev) => [...prev, userMsg]);
    }

    const response = await fetch(`${import.meta.env.VITE_AGENT_URL}/maya`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "client",
        sessionId,
        message: nextMessage,
        confirmed,
      }),
    });

    const data = (await response.json()) as MayaResponse;

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply || "I can help with that." },
    ]);

    setRequiresConfirmation(
      Boolean(data.requiresConfirmation && data.action === "book")
    );
    setEscalated(Boolean(data.escalated));
    setInput("");
  }

  return (
    <div
      id="portal-messages"
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        borderRadius: "8px",
      }}
    >
      <h3>Maya — Funding Assistant</h3>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((message, index) => (
          <div key={index}>
            <strong>{message.role === "user" ? "You" : "Maya"}:</strong>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      {escalated && (
        <div style={{ color: "red", marginTop: "0.75rem" }}>
          A Boreal specialist has been notified.
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          style={{ width: "75%" }}
        />
        <button onClick={() => sendMessage()}>Send</button>
      </div>

      {requiresConfirmation && (
        <button onClick={() => sendMessage(true)} style={{ marginTop: "0.5rem" }}>
          Confirm Booking
        </button>
      )}
    </div>
  );
}
