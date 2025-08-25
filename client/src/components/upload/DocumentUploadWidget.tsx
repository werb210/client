// Remove S3 imports and call Staff API uploader
import React from "react";
import { uploadDocument, listDocuments } from "@/lib/api";

export function DocumentUploadWidget({ applicationId }: { applicationId: string }) {
  const [busy, setBusy] = React.useState(false);
  const [type, setType] = React.useState("bank_statements");
  const [files, setFiles] = React.useState<FileList | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        await uploadDocument(applicationId, f, type);
      }
      // optional: force refresh elsewhere with a callback/event
      await listDocuments(applicationId);
      alert("Upload complete");
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select value={type} onChange={e => setType(e.target.value)} className="input">
        <option value="bank_statements">Bank Statements</option>
        <option value="financial_statements">Financial Statements</option>
        <option value="tax_returns">Tax Returns</option>
        <option value="business_license">Business License</option>
      </select>
      <input type="file" multiple onChange={e => setFiles(e.currentTarget.files)} />
      <button disabled={busy} className="btn btn-primary">{busy ? "Uploading…" : "Upload"}</button>
    </form>
  );
}