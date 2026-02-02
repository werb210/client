const CHAT_STORAGE_PREFIX = "boreal_portal_chat_history";

export type ChatMessage = {
  from: string;
  text: string;
  createdAt?: string;
};

export function loadChatHistory(token: string | null) {
  if (!token) return [];
  try {
    const raw = localStorage.getItem(`${CHAT_STORAGE_PREFIX}:${token}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load chat history:", error);
    return [];
  }
}

export function saveChatHistory(token: string | null, messages: ChatMessage[]) {
  if (!token) return;
  try {
    localStorage.setItem(
      `${CHAT_STORAGE_PREFIX}:${token}`,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.warn("Failed to save chat history:", error);
  }
}
