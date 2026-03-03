import React from "react";
import { startCall } from "../services/voiceDevice";

export default function CallUsButton() {
  const handleClick = async () => {
    try {
      await startCall("support");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: "12px 20px",
        background: "#0b6cff",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Call Us
    </button>
  );
}
