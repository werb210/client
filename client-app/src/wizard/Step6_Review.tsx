import { useApplicationStore } from "../state/useApplicationStore";

export function Step6_Review() {
  const { app, update } = useApplicationStore();

  function submit() {
    update({ termsAccepted: true });
    alert("Submit placeholder");
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 6: Review & Submit</h1>
      <pre className="bg-gray-100 p-2 text-sm mb-4">
        {JSON.stringify(app, null, 2)}
      </pre>
      <button className="bg-borealGreen text-white p-2" onClick={submit}>
        Submit Application
      </button>
    </div>
  );
}
