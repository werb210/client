import { useApplicationStore } from "../state/useApplicationStore";

export function Step1_KYC() {
  const { app, update } = useApplicationStore();
  function next() {
    update({ kyc: { ...app.kyc } });
    window.location.href = "/apply/step-2";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 1: Basic Questions</h1>
      <p className="mb-4">Placeholder inputs for KYC questions.</p>
      <button className="bg-borealBlue text-white p-2" onClick={next}>
        Continue
      </button>
    </div>
  );
}
