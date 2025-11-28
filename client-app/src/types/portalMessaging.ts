// src/types/portalMessaging.ts

export type PortalMessageChannel = "human" | "ai";

export type PortalMessageAuthor = "client" | "staff" | "ai";

export interface PortalMessage {
  id: string;
  channel: PortalMessageChannel;
  author: PortalMessageAuthor;
  text: string;
  createdAt: string; // ISO string
}

export interface PortalMessagesResponse {
  messages: PortalMessage[];
}
