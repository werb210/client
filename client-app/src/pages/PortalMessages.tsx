import { useEffect, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { PortalNav } from "../components/portal/PortalNav";
import { MessageBubble } from "../components/portal/MessageBubble";
import { ChatInput } from "../components/portal/ChatInput";
import { api } from "../api";
import { requirePortalAuth } from "../utils/requirePortalAuth";

type PortalMessage = {
  text: string;
  role: "client" | "advisor" | string;
  timestamp: string | number | Date;
};

export default function PortalMessages() {
  const auth = requirePortalAuth();
  const applicationId = auth?.applicationId ?? "";

  const [messages, setMessages] = useState<PortalMessage[]>([]);

  useEffect(() => {
    if (!applicationId) return;

    api.get(`/application/${applicationId}/messages`).then((res) => {
      setMessages(res.data ?? []);
    });
  }, [applicationId]);

  if (!auth) return <PageContainer title="Loading..." />;

  async function send(text: string) {
    if (!text.trim()) return;

    await api.post(`/application/${applicationId}/messages`, { text });
    setMessages((prev) => [
      ...prev,
      { text, role: "client", timestamp: new Date().toISOString() },
    ]);
  }

  return (
    <PageContainer>
      <PortalNav applicationId={applicationId} />

      <div className="space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} {...message} />
        ))}
      </div>

      <ChatInput
        placeholder="Type a message to our team..."
        onSend={send}
      />
    </PageContainer>
  );
}
