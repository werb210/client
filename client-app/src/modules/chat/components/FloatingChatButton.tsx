interface FloatingChatButtonProps {
  onClick: () => void;
  hidden?: boolean;
}

export function FloatingChatButton({ onClick, hidden = false }: FloatingChatButtonProps) {
  if (hidden) return null;

  return (
    <button
      aria-label="Open chat"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#0a2540] text-white shadow-xl transition hover:opacity-90"
    >
      <span className="text-2xl">💬</span>
    </button>
  );
}
