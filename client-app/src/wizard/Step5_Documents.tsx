import { useApplicationStore } from "../state/useApplicationStore";

export function Step5_Documents() {
  const { update } = useApplicationStore();

  function next() {
    update({ documents: {} });
    window.location.href = "/apply/step-6";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 5: Required Documents</h1>
      <p>Document upload placeholder.</p>
      <button className="bg-borealBlue text-white p-2 mt-4" onClick={next}>
        Continue
      </button>
    </div>
  );
}
