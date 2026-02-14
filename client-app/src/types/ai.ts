export interface AiSession {
  sessionId: string;
  escalated: boolean;
  takeover: boolean;
}

export interface AiMessage {
  role: "user" | "assistant" | "staff";
  content: string;
  createdAt?: string;
}
