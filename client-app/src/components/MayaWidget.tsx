import { useState } from "react";
import html2canvas from "html2canvas";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function MayaWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m Maya, Boreal Financial’s AI Assistant. How can I help today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "score">("chat");

  async function send() {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, mode }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    }

    setLoading(false);
  }

  async function checkScore() {
    setLoading(true);

    try {
      const res = await fetch("/api/credit/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message ?? "Credit score request submitted.",
        },
      ]);
      setMode("score");
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to check score right now." },
      ]);
    }

    setLoading(false);
  }

  async function talkToHuman() {
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: "",
        fullName: "",
        email: "",
        phone: "",
      }),
    });

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Transferring you to a Boreal specialist.",
      },
    ]);
  }

  async function reportIssue() {
    const screenshot = await html2canvas(document.body).then((canvas) =>
      canvas.toDataURL("image/png")
    );

    await fetch("/api/support/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Client reported issue",
        screenshot,
      }),
    });

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Issue reported successfully.",
      },
    ]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black px-4 py-3 text-white shadow-lg"
      >
        Ask Maya
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 flex w-96 flex-col rounded-lg border bg-white shadow-2xl">
          <div className="flex justify-between border-b p-4 font-semibold">
            Maya — AI Assistant
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="flex-1 space-y-2 overflow-auto p-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                {m.content}
              </div>
            ))}
            {loading && <div>Typing...</div>}
          </div>

          <div className="space-y-2 border-t p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border p-2"
              placeholder="Ask about financing..."
            />

            <button onClick={send} className="w-full rounded bg-black py-2 text-white">
              Ask AI
            </button>

            <button
              onClick={checkScore}
              className="w-full rounded border border-black py-2 text-xs text-black"
            >
              Credit Readiness Check
            </button>

            <div className="flex gap-2">
              <button
                onClick={talkToHuman}
                className="flex-1 rounded bg-green-600 py-2 text-xs text-white"
              >
                Talk to a Human
              </button>

              <button
                onClick={reportIssue}
                className="flex-1 rounded bg-red-600 py-2 text-xs text-white"
              >
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
