import { useMemo, useState } from "react";
import { useApplicationStore } from "@/state/useApplicationStore";
import { useChatSocket } from "@/hooks/useChatSocket";

type ChatItem = { id: string; role: "user" | "ai" | "system"; message: string };

function getSessionId(candidate: string | undefined): string | null {
  if (!candidate) return null;
  return candidate.trim() || null;
}

export default function ChatSupportWidget() {
  const { app } = useApplicationStore();
  const [open, setOpen] = useState(false);
  const [staffJoined, setStaffJoined] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatItem[]>([]);

  const sessionId = useMemo(
    () =>
      getSessionId(app.applicationId) ||
      getSessionId(app.applicationToken) ||
      getSessionId(app.readinessLeadId) ||
      getSessionId(localStorage.getItem("leadId") || undefined),
    [app.applicationId, app.applicationToken, app.readinessLeadId]
  );

  const { status, send } = useChatSocket({
    enabled: open,
    sessionId,
    onStaffJoined: () => {
      setStaffJoined(true);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "system", message: "Transferring you…" },
      ]);
    },
    onMessage: (message) => {
      if (staffJoined) return;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", message }]);
    },
  });

  const handleSend = () => {
    const value = input.trim();
    if (!value || !sessionId || staffJoined) return;

    const sent = send(value);
    if (!sent) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", message: value }]);
    setInput("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#0a2540] text-white shadow-xl transition hover:opacity-90"
      >
        <span className="text-2xl">💬</span>
      </button>

      {open && (
        <aside className="fixed bottom-24 right-6 z-[75] flex h-[28rem] w-[22rem] flex-col rounded-lg border border-slate-200 bg-white shadow-2xl">
          <header className="border-b px-4 py-3 text-sm font-semibold">Support Chat</header>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.length === 0 && <p className="text-slate-500">How can we help?</p>}
            {messages.map((message) => (
              <p key={message.id} className="leading-relaxed">
                <strong>{message.role}:</strong> {message.message}
              </p>
            ))}
          </div>
          <div className="border-t p-3">
            <p className="mb-2 text-xs text-slate-500">
              {staffJoined
                ? "A specialist has joined this chat."
                : status === "connected"
                  ? "Connected"
                  : status === "reconnecting"
                    ? "Reconnecting…"
                    : "Connecting…"}
            </p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="flex-1 rounded border p-2 text-sm"
                placeholder={sessionId ? "Type your message" : "Session required to chat"}
                disabled={!sessionId || staffJoined}
              />
              <button
                type="button"
                className="rounded bg-[#0a2540] px-3 text-sm text-white disabled:opacity-50"
                onClick={handleSend}
                disabled={!sessionId || staffJoined || status !== "connected"}
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
