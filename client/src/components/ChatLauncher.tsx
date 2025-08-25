import React, { lazy, Suspense, useState } from "react";
import { useChatBot } from "@/hooks/useChatBot";

const LazyChatBot = lazy(() => import("../components/ChatBot").then(module => ({ default: module.ChatBot })));

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const { currentStep, applicationData } = useChatBot();

  // Optional: prefetch on hover to hide the spinner
  const prefetch = () => { import("../components/ChatBot"); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={prefetch}
        className="fixed bottom-6 right-6 rounded-full shadow-lg px-4 py-3 text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        aria-label="Open chat"
      >
        💬 Chat
      </button>
    );
  }

  return (
    <Suspense fallback={<div className="fixed bottom-6 right-6 p-3 bg-white rounded-full shadow-lg">Loading chat…</div>}>
      <LazyChatBot 
        isOpen={true}
        onToggle={() => setOpen(false)}
        currentStep={currentStep}
        applicationData={applicationData}
      />
    </Suspense>
  );
}