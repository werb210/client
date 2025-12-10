import { useApplicationStore } from "../state/useApplicationStore";

export function Step3_Business() {
  const { app, update } = useApplicationStore();

  function next() {
    update({ business: { ...app.business } });
    window.location.href = "/apply/step-4";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 3: Business Details</h1>
      <p>Placeholder business inputs.</p>
      <button className="bg-borealBlue text-white p-2 mt-4" onClick={next}>
        Continue
      </button>
    </div>
  );
}
