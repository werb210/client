import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

export async function createAiSession(context: "client") {
  const res = await api.post("/api/ai/session", { context });
  return res.data;
}

export async function sendAiMessage(sessionId: string, message: string) {
  const res = await api.post("/api/ai/message", {
    sessionId,
    message,
  });
  return res.data;
}

export async function escalateAi(sessionId: string) {
  const res = await api.post("/api/ai/escalate", { sessionId });
  return res.data;
}

export async function reportIssue(sessionId: string, description: string, screenshot: string) {
  const res = await api.post("/api/ai/report", {
    sessionId,
    description,
    screenshot,
  });
  return res.data;
}
