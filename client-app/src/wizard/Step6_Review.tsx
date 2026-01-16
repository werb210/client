import { useEffect, useMemo, useState } from "react";
import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export function Step6_Review() {
  const { app, update } = useApplicationStore();
  const [submitted, setSubmitted] = useState(false);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (app.currentStep !== 6) {
      update({ currentStep: 6 });
    }
  }, [app.currentStep, update]);

  useEffect(() => {
    if (!app.signatureDate) {
      update({ signatureDate: today });
    }
  }, [app.signatureDate, today, update]);

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
      signatureDate: app.signatureDate || today,
    });
    await ClientAppAPI.submit(app.applicationToken!);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Card className="space-y-3 text-center py-10">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Application submitted
          </div>
          <h1 className="text-2xl font-semibold text-borealBlue">
            Thank you for your submission.
          </h1>
          <p className="text-sm text-slate-600">
            We’ve received your application and will notify you about next
            steps. You can also review updates in your client portal.
          </p>
          <Button
            className="mt-2 w-full md:w-auto"
            onClick={() => (window.location.href = `/status?token=${app.applicationToken}`)}
          >
            View application status
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <StepHeader step={6} title="Terms & Signature" />

      <Card className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">Date</label>
            <Input value={app.signatureDate || today} readOnly />
          </div>

          <label className="flex items-start gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={app.termsAccepted}
              onChange={toggleTerms}
              className="mt-1"
            />
            <span>I agree to the Terms & Conditions</span>
          </label>
        </div>

        <Button
          className={`w-full md:w-auto ${
            app.termsAccepted && app.typedSignature?.trim()
              ? ""
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={submit}
          disabled={!app.termsAccepted || !app.typedSignature?.trim()}
        >
          Submit application
        </Button>
      </Card>
    </div>
  );
}
