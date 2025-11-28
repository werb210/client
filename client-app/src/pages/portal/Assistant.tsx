import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function Assistant() {
  const [search] = useSearchParams();
  const applicationId = search.get("applicationId");
  const token = useMemo(() => localStorage.getItem("clientToken"), []);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  async function sendToAI() {
    if (!text.trim() || !applicationId || !token) return;

    const message = text;
    setText("");

    setChat((prev) => [...prev, { role: "user", text: message }]);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/public/assistant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ applicationId, message }),
    });

    if (!res.ok) return;

    const data = (await res.json()) as { reply: string };

    setChat((prev) => [...prev, { role: "assistant", text: data.reply }]);
  }

  return (
    <PageContainer title="AI Assistant">
      <div className="space-y-4">
        {chat.map((c, i) => (
          <div
            key={i}
            className={`p-3 rounded ${
              c.role === "user" ? "bg-blue-100" : "bg-gray-200"
            }`}
          >
            {c.text}
          </div>
        ))}

        <textarea
          className="w-full border rounded p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question..."
        />

        <Button onClick={sendToAI}>Send</Button>
      </div>
    </PageContainer>
  );
}
