import type { ChangeEvent, FC } from "react";

type DocumentItemProps = {
  doc: { id: string; label: string };
  uploaded?: { fileName: string } | null;
  onUpload: (event: ChangeEvent<HTMLInputElement>, docId: string) => void;
};

export const DocumentItem: FC<DocumentItemProps> = ({ doc, uploaded, onUpload }) => {
  return (
    <div className="p-4 border rounded mb-3 bg-gray-50">
      <p className="font-semibold">{doc.label}</p>

      {uploaded ? (
        <p className="text-green-700 text-sm mt-2">Uploaded: {uploaded.fileName}</p>
      ) : (
        <div className="mt-3">
          <input type="file" onChange={(e) => onUpload(e, doc.id)} className="block" />
        </div>
      )}
    </div>
  );
};
