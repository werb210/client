"use client";
import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ onChange }: { onChange: (data: string | null) => void }) {
  const ref = useRef<SignatureCanvas | null>(null);

  function handleEnd() {
    if (!ref.current) return;
    const data = ref.current.toDataURL("image/png");
    onChange(data);
  }

  return (
    <div className="border rounded p-2 bg-white">
      <SignatureCanvas
        ref={ref}
        penColor="black"
        canvasProps={{
          width: 500,
          height: 200,
          className: "border rounded",
        }}
        onEnd={handleEnd}
      />
    </div>
  );
}
