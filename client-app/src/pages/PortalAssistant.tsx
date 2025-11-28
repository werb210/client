import { useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { PortalNav } from "../components/portal/PortalNav";
import { MessageBubble } from "../components/portal/MessageBubble";
import { ChatInput } from "../components/portal/ChatInput";
import { api } from "../api";
import { requirePortalAuth } from "../utils/requirePortalAuth";

type AssistantMessage = {
  text: string;
  role: "client" | "bot" | string;
  timestamp: string | number | Date;
};

export default function PortalAssistant() {
  const auth = requirePortalAuth();
  const applicationId = auth?.applicationId ?? "";

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      text: "Hello! How can I help you today?",
      role: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  if (!auth) return <PageContainer title="Loading..." />;

  async function send(text: string) {
    if (!text.trim()) return;

    const clientMessage: AssistantMessage = {
      text,
      role: "client",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, clientMessage]);
    setIsSending(true);

    try {
      const res = await api.post(`/application/${applicationId}/assistant`, {
        text,
      });

      const botResponse: AssistantMessage = {
        text: res.data?.message ?? "",
        role: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsSending(false);
    }
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
        placeholder="Ask Boreal AI a question..."
        onSend={send}
        disabled={isSending}
      />
    </PageContainer>
  );
}
