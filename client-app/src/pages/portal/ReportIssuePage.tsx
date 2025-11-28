import React from "react";
import { useClientSession } from "../../state/useClientSession";

export default function ReportIssuePage() {
  const token = useClientSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Report an Issue</h1>

      {!token && (
        <p className="text-red-600 font-semibold">
          You must be logged in to report an issue.
        </p>
      )}

      <form className="space-y-4 mt-6 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            placeholder="Brief summary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 h-32"
            placeholder="Describe the issue in detail"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
