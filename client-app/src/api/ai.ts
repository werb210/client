import api from "./client";

export async function createAiSession(source: "client") {
  const res = await api.post("/api/ai/session", { source });
  return res.data;
}

export async function sendAiMessage(sessionId: string, message: string) {
  const res = await api.post(`/api/ai/session/${sessionId}/message`, { message });
  return res.data;
}

export async function escalateToHuman(sessionId: string) {
  return api.post(`/api/ai/session/${sessionId}/escalate`);
}

export async function reportIssue(sessionId: string, description: string, screenshot: string) {
  return api.post(`/api/ai/session/${sessionId}/report`, {
    description,
    screenshot,
  });
}
