import React, { useState } from "react";
import { ChatBubbleBottomCenterIcon } from "@heroicons/react/24/solid";
import { SupportPanel } from "./SupportPanel";

export function SupportWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-50 
          bg-blue-600 hover:bg-blue-700 
          text-white rounded-full shadow-lg 
          w-14 h-14 flex items-center justify-center
        "
      >
        <ChatBubbleBottomCenterIcon className="w-7 h-7" />
      </button>

      {/* Slide-up panel */}
      {open && <SupportPanel onClose={() => setOpen(false)} />}
    </>
  );
}
