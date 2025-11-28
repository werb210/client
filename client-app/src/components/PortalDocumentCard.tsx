"use client";
import React from "react";

interface PortalDocumentCardProps {
  document: {
    type: string;
    label: string;
    description?: string;
  };
  onUpload: (docType: string, file: File) => void;
}

export default function PortalDocumentCard({ document, onUpload }: PortalDocumentCardProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(document.type, file);
  }

  return (
    <div className="border p-4 rounded flex justify-between items-center bg-white">
      <div>
        <div className="font-semibold">{document.label}</div>
        {document.description && (
          <div className="text-xs text-gray-600">{document.description}</div>
        )}
      </div>

      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleChange}
        className="text-sm"
      />
    </div>
  );
}
