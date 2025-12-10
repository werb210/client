import { useApplicationStore } from "../state/useApplicationStore";

export function Step4_Applicant() {
  const { app, update } = useApplicationStore();

  function next() {
    update({ applicant: { ...app.applicant } });
    window.location.href = "/apply/step-5";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 4: Applicant Information</h1>
      <p>Placeholder applicant inputs.</p>
      <button className="bg-borealBlue text-white p-2 mt-4" onClick={next}>
        Continue
      </button>
    </div>
  );
}
