import React from "react";

interface Props {
  label: string;
  accept?: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export function FileUploader({ label, accept, file, onChange }: Props) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  }

  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleFile}
        className="block w-full text-sm"
      />

      {file && <p className="text-sm text-green-700 mt-1">Uploaded: {file.name}</p>}
    </div>
  );
}
