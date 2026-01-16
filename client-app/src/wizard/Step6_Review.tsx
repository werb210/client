import { useEffect, useMemo, useState } from "react";
import { useApplicationStore } from "../state/useApplicationStore";
import { TERMS_TEXT } from "../data/terms";
import { ClientAppAPI } from "../api/clientApp";
import { StepHeader } from "../components/StepHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { WizardLayout } from "../components/WizardLayout";
import { theme } from "../styles/theme";

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
      <WizardLayout>
        <Card
          className="space-y-3"
          style={{ textAlign: "center", padding: theme.spacing.xl }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: theme.colors.textSecondary,
            }}
          >
            Application submitted
          </div>
          <h1
            style={{
              fontSize: theme.typography.h1.fontSize,
              fontWeight: theme.typography.h1.fontWeight,
              color: theme.colors.textPrimary,
              margin: 0,
            }}
          >
            Thank you for your submission.
          </h1>
          <p style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
            We’ve received your application and will notify you about next
            steps. You can also review updates in your client portal.
          </p>
          <Button
            style={{ marginTop: theme.spacing.sm, width: "100%", maxWidth: "260px" }}
            onClick={() =>
              (window.location.href = `/status?token=${app.applicationToken}`)
            }
          >
            View application status
          </Button>
        </Card>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout>
      <StepHeader step={6} title="Terms & Signature" />

      <Card className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <h2
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                marginBottom: theme.spacing.xs,
                color: theme.colors.textPrimary,
              }}
            >
              Terms & Conditions
            </h2>
            <div
              style={{
                background: theme.colors.background,
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.layout.radius,
                fontSize: "14px",
                color: theme.colors.textSecondary,
                whiteSpace: "pre-line",
              }}
            >
              {TERMS_TEXT}
            </div>
          </div>

          <div className="space-y-2">
            <label
              style={{
                display: "block",
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.textSecondary,
              }}
            >
              Typed signature
            </label>
            <Input
              placeholder="Type your full legal name"
              value={app.typedSignature || ""}
              onChange={(e: any) => update({ typedSignature: e.target.value })}
            />
            <p style={{ fontSize: "12px", color: theme.colors.textSecondary }}>
              By typing your name, you are providing a legally binding signature.
            </p>
          </div>

          <div className="space-y-2">
            <label
              style={{
                display: "block",
                fontSize: theme.typography.label.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.textSecondary,
              }}
            >
              Date
            </label>
            <Input value={app.signatureDate || today} readOnly />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: theme.spacing.xs,
              fontSize: theme.typography.label.fontSize,
              fontWeight: theme.typography.label.fontWeight,
              color: theme.colors.textPrimary,
            }}
            className="md:col-span-2"
          >
            <input
              type="checkbox"
              checked={app.termsAccepted}
              onChange={toggleTerms}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "4px",
                border: `1px solid ${theme.colors.border}`,
                background: app.termsAccepted ? theme.colors.primary : theme.colors.surface,
                display: "inline-grid",
                placeContent: "center",
                appearance: "none",
                marginTop: "2px",
                backgroundImage: app.termsAccepted
                  ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 10.5l3 3 7-7' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"
                  : "none",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "12px",
              }}
            />
            <span>I agree to the Terms & Conditions</span>
          </label>
        </div>

        <Button
          style={{
            width: "100%",
            maxWidth: "240px",
            marginTop: theme.spacing.sm,
          }}
          onClick={submit}
          disabled={!app.termsAccepted || !app.typedSignature?.trim()}
        >
          Submit application
        </Button>
      </Card>
    </WizardLayout>
  );
}

export default Step6_Review;
