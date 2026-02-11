import { api } from "./client";

export type AiUserType = "visitor" | "client";

export type AiMessage = {
  role: "user" | "assistant" | "staff";
  content: string;
  timestamp: string;
};

export type AiPageContext = {
  pageUrl: string;
  currentProductPage: string | null;
  country: string;
  language: string;
};

export type AiChatRequest = {
  sessionId: string;
  message: string;
  pageContext: AiPageContext;
  userType: AiUserType;
};

export type AiChatResponse = {
  reply: string;
  escalate?: boolean;
  knowledgeSource?: string;
};

export type AiEscalateResponse = {
  queued: boolean;
  message?: string;
};

export type AiIssueReportRequest = {
  description: {
    activity: string;
    issue: string;
    email?: string;
  };
  pageUrl: string;
  screenshotBase64: string;
  userAgent: string;
};

export const AiApi = {
  async chat(payload: AiChatRequest) {
    const response = await api.post<AiChatResponse>("/api/ai/chat", payload);
    return response.data;
  },

  async escalate(sessionId: string) {
    const response = await api.post<AiEscalateResponse>("/api/ai/escalate", { sessionId });
    return response.data;
  },

  async reportIssue(payload: AiIssueReportRequest) {
    await api.post("/api/ai/report", payload);
  },
};

export function createAiSessionId() {
  const fromCrypto =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `ai_${fromCrypto}`;
}

export function getPageContext(): AiPageContext {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const currentProductPage = segments[0] === "application" && segments[1] ? segments[1] : null;

  return {
    pageUrl: typeof window === "undefined" ? "" : window.location.href,
    currentProductPage,
    country: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    language: typeof navigator === "undefined" ? "en" : navigator.language || "en",
  };
}
