import { type FormEvent, useState } from "react";
import html2canvas from "@/utils/html2canvas";
import { reportIssue } from "../api";

interface IssueReportFormProps {
  sessionId?: string;
  onDone: () => void;
}

export function IssueReportForm({ sessionId, onDone }: IssueReportFormProps) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const canvas = await html2canvas(document.body);
      await reportIssue(description, canvas.toDataURL("image/png"), sessionId);
      onDone();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 border-t p-3">
      <h4 className="text-sm font-semibold">Report an Issue</h4>
      <textarea
        required
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="h-24 w-full rounded border p-2 text-sm"
        placeholder="Describe what went wrong"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-red-600 py-2 text-sm text-white disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Submit Issue"}
      </button>
    </form>
  );
}
