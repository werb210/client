import type { FC } from "react";

type MessageBubbleProps = {
  text: string;
  role: "client" | "advisor" | string;
  timestamp: string | number | Date;
};

export const MessageBubble: FC<MessageBubbleProps> = ({ text, role, timestamp }) => {
  const isClient = role === "client";

  return (
    <div className={`p-3 rounded-lg max-w-[75%] ${isClient ? "bg-blue-100 ml-auto" : "bg-gray-200"}`}>
      <p>{text}</p>

      <p className="text-[10px] text-gray-500 mt-1">{new Date(timestamp).toLocaleString()}</p>
    </div>
  );
};
