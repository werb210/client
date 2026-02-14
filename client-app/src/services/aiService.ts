import axios from "@/api";

export async function startAiSession(payload: { context: "website" | "client" }) {
  const res = await axios.post("/api/ai/session/start", payload);
  return res.data as { sessionId: string };
}

export async function sendAiMessage(sessionId: string, message: string) {
  const res = await axios.post("/api/ai/message", {
    sessionId,
    message,
  });
  return res.data as { reply: string };
}

export async function escalateToHuman(sessionId: string) {
  await axios.post("/api/ai/escalate", { sessionId });
}

export async function reportIssue(sessionId: string, message: string, screenshot?: string) {
  await axios.post("/api/ai/report", {
    sessionId,
    message,
    screenshot,
  });
}
