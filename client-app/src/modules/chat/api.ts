import { api } from "@/api/client";
import type { LeadCaptureInput, QualificationInput } from "./types";

export const startSession = async () => {
  const res = await api.post("/api/chat/start", {
    source: "client",
  });
  return res.data;
};

export const sendMessage = async (sessionId: string, message: string) => {
  const res = await api.post("/api/chat/message", {
    sessionId,
    message,
  });
  return res.data;
};

export const escalateToHuman = async (sessionId: string) => {
  const res = await api.post("/api/chat/escalate", {
    sessionId,
  });
  return res.data;
};

export const reportIssue = async (description: string, screenshotBase64: string, sessionId?: string) => {
  const res = await api.post("/api/chat/report-issue", {
    description,
    screenshot: screenshotBase64,
    sessionId,
    source: "client",
  });
  return res.data;
};

export const pollMessages = async (sessionId: string) => {
  const res = await api.get("/api/chat/messages", {
    params: { sessionId },
  });
  return res.data;
};

export const submitLeadCapture = async (sessionId: string, payload: LeadCaptureInput) => {
  const res = await api.post("/api/chat/lead", {
    sessionId,
    ...payload,
  });
  return res.data;
};

export const submitQualification = async (sessionId: string, payload: QualificationInput) => {
  const res = await api.post("/api/chat/qualification", {
    sessionId,
    tag: "confidence_check",
    ...payload,
  });
  return res.data;
};

export const submitStartupInterest = async (sessionId: string, payload: LeadCaptureInput) => {
  const res = await api.post("/api/chat/startup-interest", {
    sessionId,
    tag: "startup_interest",
    ...payload,
  });
  return res.data;
};
