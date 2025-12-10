import { useState } from "react";
import { AIChat, setAIKey } from "../api/ai";
import { ClientAppAPI } from "../api/clientApp";
import { OfflineStore } from "../state/offline";

export function useChatbot() {
  const cached = OfflineStore.load();
  const token = cached?.applicationToken;

  const assistantId = import.meta.env.VITE_OPENAI_ASSISTANT_ID;
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const [threadId, setThreadId] = useState<string | null>(
    cached?.chatThreadId || null
  );

  if (apiKey) setAIKey(apiKey);

  async function ensureThread() {
    if (threadId) return threadId;

    // Create thread
    const res = await AIChat.ai.post("/threads", {});
    const newId = res.data.id;

    setThreadId(newId);

    OfflineStore.save({
      ...cached,
      chatThreadId: newId,
    });

    return newId;
  }

  async function send(text: string) {
    const th = await ensureThread();

    // Log to staff
    if (token) await ClientAppAPI.sendMessage(token, text);

    const aiRes = await AIChat.sendMessage(assistantId, th, text);

    const reply = aiRes?.content?.[0]?.text?.value || "I'm here to help.";

    // Log AI reply to staff server
    if (token) await ClientAppAPI.sendMessage(token, reply);

    return reply;
  }

  return { send };
}
