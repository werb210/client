import React, { useState } from "react";
import { useClientSession } from "@/state/useClientSession";
import { portalPost } from "@/api/portal";

export default function ReportIssuePage() {
  const { token, applicationId } = useClientSession();
  const [text, setText] = useState("");

  async function submit() {
    if (!text.trim()) return;
    await portalPost(`issues/${applicationId}`, { text }, token!);
    setText("");
    alert("Issue submitted. Our team will follow up.");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Report an Issue</h1>
      <p className="text-sm text-slate-500">
        Something not working correctly? Tell us and we’ll look into it.
      </p>

      <textarea
        className="w-full h-40 border border-slate-300 rounded-lg p-3 text-sm"
        placeholder="Describe your issue in detail…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2"
        onClick={submit}
      >
        Submit
      </button>
    </div>
  );
}
