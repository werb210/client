import { useApplicationStore } from "../state/useApplicationStore";
import { DefaultBusinessQuestions } from "../data/defaultQuestions";

export function Step3_Business() {
  const { app, update } = useApplicationStore();

  const business = { ...DefaultBusinessQuestions, ...app.business };

  function setField(key: string, value: any) {
    update({ business: { ...business, [key]: value } });
  }

  function next() {
    window.location.href = "/apply/step-4";
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 3: Business Details</h1>

      {Object.keys(DefaultBusinessQuestions).map((key) => (
        <label key={key} className="block mb-2 capitalize">
          {key.replace(/([A-Z])/g, " $1")}
          <input
            className="border p-2 w-full"
            value={business[key] || ""}
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
