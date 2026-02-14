import api from "@/api";

export async function openChatSession(leadId: string) {
  return api.post("/chat/start", { leadId });
}

export async function escalateToHuman(sessionId: string) {
  return api.post("/chat/escalate", { sessionId });
}
