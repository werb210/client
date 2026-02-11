import { useState } from "react";
import html2canvas from "../utils/html2canvas";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask about funding, required documents, or how the lender matching works."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const updated: Message[] = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: updated })
      });

      const data = await res.json();

      setMessages([
        ...updated,
        { role: "assistant", content: data.reply || "I'm not sure. Let me connect you to a human." }
      ]);
    } catch (err) {
      setMessages([
        ...updated,
        { role: "assistant", content: "Error connecting to assistant." }
      ]);
    }

    setLoading(false);
  }

  async function reportIssue() {
    const canvas = await html2canvas(document.body);
    const screenshot = canvas.toDataURL("image/png");

    await fetch("/api/support/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenshot
      })
    });

    alert("Issue sent to support.");
  }

  function talkToHuman() {
    window.location.href = "/portal-chat";
    // This should map to live staff chat system
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-3 rounded-full shadow-lg z-50"
      >
        Chat
      </button>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white shadow-2xl rounded-lg flex flex-col z-50">

          <div className="p-4 border-b font-semibold text-sm">
            Boreal Assistant
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-3 max-h-96">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "assistant"
                    ? "text-left text-gray-800"
                    : "text-right text-black font-medium"
                }
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="text-gray-500 text-xs">
                Thinking...
              </div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about funding..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded text-sm"
            >
              Send
            </button>
          </div>

          <div className="p-3 flex justify-between text-xs border-t bg-gray-50">
            <button
              onClick={talkToHuman}
              className="hover:underline"
            >
              Talk to a Human
            </button>

            <button
              onClick={reportIssue}
              className="hover:underline"
            >
              Report Issue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
