import type { ChatMessage as ChatMessageModel } from "../types";

interface ChatMessageProps {
  message: ChatMessageModel;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const bubbleClass = isUser
    ? "ml-auto bg-slate-900 text-white"
    : message.role === "staff"
      ? "bg-[#0a2540] text-white"
      : "bg-blue-100 text-slate-800";

  return (
    <div className={`mb-2 max-w-[85%] rounded-xl px-3 py-2 text-sm ${bubbleClass}`}>
      {message.message}
    </div>
  );
}
