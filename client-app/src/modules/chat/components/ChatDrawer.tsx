import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "./ChatMessage";
import { IssueReportForm } from "./IssueReportForm";
import type { LeadCaptureInput, QualificationInput } from "../types";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const emptyLead: LeadCaptureInput = {
  companyName: "",
  fullName: "",
  email: "",
  phone: "",
};

const emptyQualification: QualificationInput = {
  industry: "",
  yearsInBusiness: "",
  monthlyRevenue: "",
  annualRevenue: "",
  accountsReceivableOutstanding: "",
  existingDebt: "",
};

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const {
    session,
    messages,
    sendMessage,
    escalate,
    saveLead,
    saveQualification,
    saveStartupInterest,
    leadCaptured,
    isInputDisabled,
  } = useChat(open);

  const [input, setInput] = useState("");
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showQualification, setShowQualification] = useState(false);
  const [showStartupInterest, setShowStartupInterest] = useState(false);
  const [lead, setLead] = useState<LeadCaptureInput>(emptyLead);
  const [startupLead, setStartupLead] = useState<LeadCaptureInput>(emptyLead);
  const [qualification, setQualification] = useState<QualificationInput>(emptyQualification);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, showQualification, showStartupInterest]);

  const shouldShowVoiceNote = session?.channel === "voice";

  const helperNote = useMemo(() => {
    if (session?.status === "closed") return "This chat session is closed.";
    if (session?.status === "human") return "You're connected to a human specialist.";
    return "We only provide ranges and guidance, never specific pricing or lender names.";
  }, [session?.status]);

  const handleSend = async () => {
    const value = input.trim();
    if (!value) return;

    if (/will\s+i\s+qualify\??/i.test(value)) {
      setShowQualification(true);
    }

    if (/startup\s+funding|startup/i.test(value)) {
      setShowStartupInterest(true);
    }

    await sendMessage(value);
    setInput("");
  };

  return (
    <aside
      className={`fixed right-0 top-0 z-[75] h-full w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <header className="border-b p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">Maya – Boreal Assistant</h3>
            <p className="mt-1 text-xs text-slate-600">
              We have lenders across different capital types, including Institutional lenders,
              Banking, and Private Capital sources as well as our own funding offerings.
            </p>
          </div>
          <button onClick={onClose} className="ml-3 text-sm">✕</button>
        </div>
      </header>

      <div ref={containerRef} className="h-[calc(100%-240px)] overflow-y-auto p-4">
        {shouldShowVoiceNote && (
          <p className="mb-3 rounded bg-slate-100 p-2 text-xs">Voice assistant coming soon.</p>
        )}

        {!leadCaptured && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveLead(lead);
            }}
            className="mb-4 space-y-2 rounded border p-3"
          >
            <h4 className="text-sm font-semibold">Tell us about you</h4>
            <input
              required
              placeholder="Company Name"
              className="w-full rounded border p-2 text-sm"
              value={lead.companyName}
              onChange={(event) => setLead((prev) => ({ ...prev, companyName: event.target.value }))}
            />
            <input
              required
              placeholder="Full Name"
              className="w-full rounded border p-2 text-sm"
              value={lead.fullName}
              onChange={(event) => setLead((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded border p-2 text-sm"
              value={lead.email}
              onChange={(event) => setLead((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              required
              placeholder="Phone"
              className="w-full rounded border p-2 text-sm"
              value={lead.phone}
              onChange={(event) => setLead((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <button type="submit" className="w-full rounded bg-slate-900 py-2 text-sm text-white">
              Continue
            </button>
          </form>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {showQualification && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveQualification(qualification);
              setShowQualification(false);
            }}
            className="mt-3 space-y-2 rounded border p-3"
          >
            <h4 className="text-sm font-semibold">Qualification Check</h4>
            {Object.entries(qualification).map(([key, value]) => (
              <input
                key={key}
                required
                value={value}
                onChange={(event) =>
                  setQualification((prev) => ({ ...prev, [key]: event.target.value }))
                }
                className="w-full rounded border p-2 text-sm"
                placeholder={key.replace(/[A-Z]/g, " $&")}
              />
            ))}
            <button className="w-full rounded bg-blue-700 py-2 text-sm text-white" type="submit">
              Submit qualification
            </button>
          </form>
        )}

        {showStartupInterest && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void saveStartupInterest(startupLead);
              setShowStartupInterest(false);
            }}
            className="mt-3 space-y-2 rounded border p-3"
          >
            <p className="text-sm">Startup funding is coming soon.</p>
            <input
              required
              placeholder="Company"
              className="w-full rounded border p-2 text-sm"
              value={startupLead.companyName}
              onChange={(event) =>
                setStartupLead((prev) => ({ ...prev, companyName: event.target.value }))
              }
            />
            <input
              required
              placeholder="Name"
              className="w-full rounded border p-2 text-sm"
              value={startupLead.fullName}
              onChange={(event) => setStartupLead((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded border p-2 text-sm"
              value={startupLead.email}
              onChange={(event) => setStartupLead((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              required
              placeholder="Phone"
              className="w-full rounded border p-2 text-sm"
              value={startupLead.phone}
              onChange={(event) => setStartupLead((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <button className="w-full rounded bg-slate-900 py-2 text-sm text-white" type="submit">
              Submit interest
            </button>
          </form>
        )}
      </div>

      <div className="border-t p-3">
        <p className="mb-2 text-xs text-slate-600">{helperNote}</p>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about financing..."
            disabled={isInputDisabled || !leadCaptured}
            className="flex-1 rounded border p-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isInputDisabled || !leadCaptured}
            className="rounded bg-blue-700 px-3 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <button
          type="button"
          onClick={() => void escalate()}
          className="mt-2 w-full rounded bg-emerald-600 py-2 text-xs text-white"
          disabled={!session || session.status !== "ai"}
        >
          Chat with a Human
        </button>

        <button
          type="button"
          onClick={() => setShowIssueForm((prev) => !prev)}
          className="mt-2 w-full rounded border py-2 text-xs"
        >
          Report an Issue
        </button>
      </div>

      {showIssueForm && <IssueReportForm sessionId={session?.id} onDone={() => setShowIssueForm(false)} />}
    </aside>
  );
}
