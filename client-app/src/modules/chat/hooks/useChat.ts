import { useCallback, useEffect, useMemo, useState } from "react";
import {
  escalateToHuman,
  pollMessages,
  sendMessage as sendMessageApi,
  startSession,
  submitLeadCapture,
  submitQualification,
  submitStartupInterest,
} from "../api";
import type {
  ChatMessage,
  ChatSession,
  LeadCaptureInput,
  QualificationInput,
} from "../types";

const CHAT_SESSION_ID_KEY = "chat_session_id";
const LEAD_CAPTURED_KEY = "chat_lead_captured";

const createLocalMessage = (message: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role: "ai",
  message,
  created_at: new Date().toISOString(),
});

export function useChat(isOpen: boolean) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState<boolean>(
    typeof window !== "undefined" && window.localStorage.getItem(LEAD_CAPTURED_KEY) === "1"
  );

  useEffect(() => {
    if (!isOpen || session || isStarting) return;

    let isCancelled = false;

    const beginSession = async () => {
      setIsStarting(true);
      try {
        const cachedSessionId = window.localStorage.getItem(CHAT_SESSION_ID_KEY);
        const result = await startSession();
        if (isCancelled) return;

        const nextSession: ChatSession = {
          id: result.session?.id ?? result.sessionId ?? cachedSessionId ?? result.id,
          status: result.session?.status ?? result.status ?? "ai",
          channel: result.session?.channel ?? result.channel ?? "chat",
        };

        setSession(nextSession);
        window.localStorage.setItem(CHAT_SESSION_ID_KEY, nextSession.id);

        const serverMessages = result.messages ?? [];
        if (serverMessages.length > 0) {
          setMessages(serverMessages);
        } else {
          setMessages([
            createLocalMessage("Hi, I'm Maya. I can help with funding options and application support."),
          ]);
        }
      } finally {
        if (!isCancelled) {
          setIsStarting(false);
        }
      }
    };

    void beginSession();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, session, isStarting]);

  useEffect(() => {
    if (!session || session.status !== "human") return;
    const timer = window.setInterval(async () => {
      const payload = await pollMessages(session.id);
      if (Array.isArray(payload?.messages)) {
        setMessages(payload.messages);
      }
      if (payload?.session?.status) {
        setSession((prev) => (prev ? { ...prev, status: payload.session.status } : prev));
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [session]);

  const sendMessage = useCallback(
    async (value: string) => {
      if (!session || !value.trim() || session.status === "closed") return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        message: value,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);
      try {
        const response = await sendMessageApi(session.id, value);
        if (Array.isArray(response?.messages)) {
          setMessages(response.messages);
        } else if (response?.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: response.message.id ?? crypto.randomUUID(),
              role: response.message.role ?? "ai",
              message: response.message.message ?? response.message.content,
              created_at: response.message.created_at ?? new Date().toISOString(),
            },
          ]);
        }
        if (response?.session?.status) {
          setSession((prev) => (prev ? { ...prev, status: response.session.status } : prev));
        }
      } finally {
        setIsSending(false);
      }
    },
    [session]
  );

  const escalate = useCallback(async () => {
    if (!session) return;
    const response = await escalateToHuman(session.id);
    setSession((prev) => (prev ? { ...prev, status: "human" } : prev));
    if (response?.message) {
      setMessages((prev) => [...prev, response.message]);
      return;
    }
    setMessages((prev) => [...prev, createLocalMessage("Transferring you…")]);
  }, [session]);

  const saveLead = useCallback(
    async (lead: LeadCaptureInput) => {
      if (!session) return;
      await submitLeadCapture(session.id, lead);
      setLeadCaptured(true);
      window.localStorage.setItem(LEAD_CAPTURED_KEY, "1");
      setMessages((prev) => [...prev, createLocalMessage("Thanks, you're all set. How can I help today?")]);
    },
    [session]
  );

  const saveQualification = useCallback(
    async (payload: QualificationInput) => {
      if (!session) return;
      await submitQualification(session.id, payload);
      setMessages((prev) => [
        ...prev,
        createLocalMessage("Thanks. I shared your details with our team for a confidence check."),
      ]);
    },
    [session]
  );

  const saveStartupInterest = useCallback(
    async (payload: LeadCaptureInput) => {
      if (!session) return;
      await submitStartupInterest(session.id, payload);
      setMessages((prev) => [
        ...prev,
        createLocalMessage("Startup funding is coming soon. We'll follow up with updates."),
      ]);
    },
    [session]
  );

  const isInputDisabled = useMemo(
    () => !session || session.status === "closed" || isSending,
    [isSending, session]
  );

  return {
    isStarting,
    session,
    messages,
    sendMessage,
    escalate,
    saveLead,
    saveQualification,
    saveStartupInterest,
    leadCaptured,
    isInputDisabled,
  };
}
