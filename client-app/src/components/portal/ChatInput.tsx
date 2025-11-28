import type { ChangeEvent, FC } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export const ChatInput: FC<ChatInputProps> = ({ value, onChange, onSend }) => {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <textarea
        className="flex-1 border rounded p-2"
        placeholder="Type a message..."
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      />

      <button onClick={onSend} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Send
      </button>
    </div>
  );
};
