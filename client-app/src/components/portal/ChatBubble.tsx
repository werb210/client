// src/components/portal/ChatBubble.tsx

import React from "react";
import type { PortalMessage } from "@/types/portalMessaging";
import clsx from "clsx";

interface ChatBubbleProps {
  message: PortalMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isClient = message.author === "client";
  const isStaff = message.author === "staff";
  const isAI = message.author === "ai";

  const background = isClient
    ? "bg-blue-600 text-white"
    : isStaff
    ? "bg-slate-100 text-slate-900"
    : "bg-emerald-50 text-emerald-900";

  const alignment = isClient ? "items-end" : "items-start";
  const bubbleAlignment = isClient ? "self-end" : "self-start";

  const label = isClient ? "You" : isStaff ? "Boreal Staff" : "Boreal AI";

  return (
    <div className={clsx("flex flex-col gap-1", alignment)}>
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={clsx(
          "px-3 py-2 rounded-2xl text-sm max-w-[80%] shadow-sm",
          background,
          bubbleAlignment
        )}
      >
        {message.text}
      </div>
      <div className="text-[10px] text-slate-400">
        {new Date(message.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
