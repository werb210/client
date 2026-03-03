import React from "react";
import { callNumber } from "../../services/voiceService";

export default function CallUsButton() {

  const handleCall = async () => {
    await callNumber("support");
  };

  return (
    <button
      onClick={handleCall}
      style={{
        padding: "14px 24px",
        background: "#0a84ff",
        color: "#fff",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer"
      }}
    >
      Call Us
    </button>
  );
}
