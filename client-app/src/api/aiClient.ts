import api from "@/api";

export interface AiChatResponse {
  sessionId: string;
  reply: string;
}

export async function sendAiMessage(
  sessionId: string | null,
  message: string,
  context: "client" | "website" = "client"
) {
  const res = await api.post<AiChatResponse>("/ai/chat", {
    sessionId,
    message,
    context,
  });

  return res.data;
}

export async function escalateToHuman(sessionId: string) {
  await api.post("/ai/escalate", { sessionId });
}
