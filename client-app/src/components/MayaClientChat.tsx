import { useState } from "react";
import { QualificationSummary } from "./QualificationSummary";
import { StartupWaitlistForm } from "./StartupWaitlistForm";
import { sendMessageToMaya, escalateMayaChat } from "../services/mayaService";
import { useMayaSession } from "../store/mayaSession";

type MayaResponse = {
  reply?: string;
  requiresConfirmation?: boolean;
  action?: string;
  escalated?: boolean;
  qualification?: Partial<Record<"funding_amount" | "annual_revenue" | "time_in_business" | "product_type" | "industry", string | number | null>>;
  startupUnavailable?: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function MayaClientChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [showStartupWaitlist, setShowStartupWaitlist] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const setField = useMayaSession((state) => state.setField);

  async function sendMessage() {
    if (!input.trim()) return;

    const nextMessage = input;
    const userMsg: ChatMessage = { role: "user", content: nextMessage };
    setMessages((prev) => [...prev, userMsg]);

    const { data } = (await sendMessageToMaya(nextMessage)) as { data: MayaResponse };

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply || "I can help with that." },
    ]);

    if (data.qualification) {
      for (const [field, value] of Object.entries(data.qualification)) {
        setField(field, value);
      }
    }

    setRequiresConfirmation(
      Boolean(data.requiresConfirmation && data.action === "book")
    );
    setEscalated(Boolean(data.escalated));
    setShowStartupWaitlist(Boolean(data.startupUnavailable));
    setInput("");
  }

  async function escalateToHuman() {
    await escalateMayaChat();
    setEscalated(true);
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

      <label style={{ display: "inline-flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={(event) => setVoiceEnabled(event.target.checked)}
        />
        Voice mode ready
      </label>

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

      <button onClick={escalateToHuman} style={{ marginTop: "0.75rem" }}>
        Talk to a Human
      </button>

      <div style={{ marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          style={{ width: "75%" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {requiresConfirmation && (
        <div style={{ marginTop: "0.5rem", color: "rgb(71 85 105)" }}>
          Please confirm your booking intent with a specialist in chat.
        </div>
      )}

      <QualificationSummary />

      {showStartupWaitlist && <StartupWaitlistForm />}
    </div>
  );
}
