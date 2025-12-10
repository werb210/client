import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultApplicantQuestions } from "../data/defaultQuestions";

export function Step4_Applicant() {
  const { app, update } = useApplicationStore();

  const applicant = { ...DefaultApplicantQuestions, ...app.applicant };

  function setField(key: string, value: any) {
    update({ applicant: { ...applicant, [key]: value } });
  }

  function next() {
    window.location.href = "/apply/step-5";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 4: Applicant Information</h1>

      {Object.keys(DefaultApplicantQuestions).map((key) => (
        <label key={key} className="block mb-2 capitalize">
          {key.replace(/([A-Z])/g, " $1")}
          <input
            className="border p-2 w-full"
            value={(applicant as any)[key] || ""}
            onChange={(e) => setField(key, e.target.value)}
          />
        </label>
      ))}

      <button className="bg-borealBlue text-white p-2" onClick={next}>
        Continue
      </button>
    </div>
  );
}
