import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export default function Messages() {
  const [search] = useSearchParams();
  const applicationId = search.get("applicationId");
  const token = useMemo(() => localStorage.getItem("clientToken"), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  async function fetchMessages() {
    if (!applicationId || !token) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/public/applications/${applicationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    setMessages((await res.json()) as Message[]);
  }

  async function sendMessage() {
    if (!applicationId || !token || !text.trim()) return;

    await fetch(
      `${import.meta.env.VITE_API_URL}/public/applications/${applicationId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    setText("");
    fetchMessages();
  }

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, token]);

  return (
    <PageContainer title="Messages">
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded ${
              m.sender === "client" ? "bg-blue-100" : "bg-gray-200"
            }`}
          >
            <p>{m.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(m.timestamp).toLocaleString()}
            </p>
          </div>
        ))}

        <textarea
          className="w-full border rounded p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />

        <Button onClick={sendMessage}>Send</Button>
      </div>
    </PageContainer>
  );
}
