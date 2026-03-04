import { useState } from "react";

export default function CallUsButton() {
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    setCalling(true);

    const phoneNumber = process.env.VITE_BF_PHONE_NUMBER;

    if (!phoneNumber) {
      setCalling(false);
      return;
    }

    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <button
      onClick={handleCall}
      disabled={calling}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {calling ? "Calling..." : "Call Us"}
    </button>
  );
}
