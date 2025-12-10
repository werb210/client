import { useApplicationStore } from "../state/useApplicationStore";
import { RequiredDocsByDefaultCategory, DefaultDocLabels } from "../data/requiredDocs";

export function Step5_Documents() {
  const { app } = useApplicationStore();

  const docs = RequiredDocsByDefaultCategory[app.productCategory || ""] || [];

  function next() {
    window.location.href = "/apply/step-6";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 5: Required Documents</h1>

      {docs.map((doc) => (
        <div key={doc} className="border p-3 mb-2">
          {DefaultDocLabels[doc] || doc}
          <div className="text-sm text-gray-500">Upload disabled (Phase 4)</div>
        </div>
      ))}

      <button className="bg-borealBlue text-white p-2 mt-4" onClick={next}>
        Continue
      </button>
    </div>
  );
}
