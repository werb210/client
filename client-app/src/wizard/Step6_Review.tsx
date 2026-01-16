import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Step6_Review() {
  const { app, update } = useApplicationStore();

  function toggleTerms() {
    update({ termsAccepted: !app.termsAccepted });
  }

  async function submit() {
    if (!app.typedSignature?.trim()) {
      alert("Please type your full name to sign.");
      return;
    }

    if (!app.termsAccepted) {
      alert("You must accept the Terms & Conditions.");
      return;
    }

    await ClientAppAPI.update(app.applicationToken!, {
      typedSignature: app.typedSignature,
      termsAccepted: app.termsAccepted,
    });
    await ClientAppAPI.submit(app.applicationToken!);
    window.location.href = `/status?token=${app.applicationToken}`;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <StepHeader step={6} title="Review & Submit" />

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold mb-2">Terms & Conditions</h2>
          <div className="bg-white p-4 border border-slate-200 rounded-xl text-sm whitespace-pre-line">
            {TERMS_TEXT}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Typed signature</label>
          <Input
            placeholder="Type your full legal name"
            value={app.typedSignature || ""}
            onChange={(e: any) => update({ typedSignature: e.target.value })}
          />
          <p className="text-xs text-slate-500">
            By typing your name, you are providing a legally binding signature.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={app.termsAccepted}
            onChange={toggleTerms}
            className="mt-1"
          />
          <span>I agree to the Terms & Conditions</span>
        </label>

        <Button
          className={`w-full md:w-auto ${
            app.termsAccepted && app.typedSignature?.trim()
              ? ""
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={submit}
        >
          Submit application
        </Button>
      </Card>
    </div>
  );
}
