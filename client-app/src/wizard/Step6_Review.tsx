import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

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
    <div className="max-w-3xl mx-auto">
      <StepHeader step={6} title="Review & Submit" />

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Your Application</h2>
          <pre className="bg-gray-100 p-3 text-sm rounded">
            {JSON.stringify(app, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Terms & Conditions</h2>
          <div className="bg-white p-3 border rounded text-sm whitespace-pre-line">
            {TERMS_TEXT}
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={app.termsAccepted}
            onChange={toggleTerms}
          />
          <span>I agree to the Terms & Conditions</span>
        </label>

        <Button
          className={`w-full md:w-auto ${
            app.termsAccepted ? "" : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={submit}
        >
          Submit Application
        </Button>
      </Card>
    </div>
  );
}
