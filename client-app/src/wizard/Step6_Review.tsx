import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";

export function Step6_Review() {
  const { app, update } = useApplicationStore();

  function toggleTerms() {
    update({ termsAccepted: !app.termsAccepted });
  }

  async function submit() {
    if (!app.termsAccepted) {
      alert("You must accept the Terms & Conditions.");
      return;
    }

    await ClientAppAPI.submit(app.applicationToken!);

    const sn = await ClientAppAPI.getSignNowUrl(app.applicationToken!);

    window.location.href = sn.data.signUrl;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Step 6: Review & Submit</h1>

      <h2 className="font-semibold mb-2">Your Application</h2>
      <pre className="bg-gray-100 p-3 text-sm mb-4 rounded">
        {JSON.stringify(app, null, 2)}
      </pre>

      <h2 className="font-semibold mb-2">Terms & Conditions</h2>
      <div className="bg-white p-3 border rounded mb-4 text-sm whitespace-pre-line">
        {TERMS_TEXT}
      </div>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={app.termsAccepted}
          onChange={toggleTerms}
        />
        <span>I agree to the Terms & Conditions</span>
      </label>

      <button
        className={`p-2 text-white ${
          app.termsAccepted ? "bg-borealGreen" : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={submit}
      >
        Submit Application
      </button>
    </div>
  );
}
