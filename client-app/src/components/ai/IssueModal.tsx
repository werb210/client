import { useMemo, useState, type ChangeEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { components, tokens } from "@/styles";
import { AiApi } from "../../api/ai";


export async function capturePageScreenshot() {
  const html2canvas = (await import("../../utils/html2canvas")).default;
  const screenshotCanvas = await html2canvas(document.body, {
    scale: 1,
  });
  return screenshotCanvas.toDataURL("image/png");
}

type IssueModalProps = {
  open: boolean;
  onClose: () => void;
};

export function IssueModal({ open, onClose }: IssueModalProps) {
  const [activity, setActivity] = useState("");
  const [issue, setIssue] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const disabled = useMemo(
    () => submitting || !activity.trim() || !issue.trim(),
    [activity, issue, submitting]
  );

  if (!open) {
    return null;
  }

  async function submitIssue() {
    if (disabled) return;
    setSubmitting(true);
    try {
      const screenshotBase64 = await capturePageScreenshot();

      await AiApi.reportIssue({
        description: {
          activity: activity.trim(),
          issue: issue.trim(),
          email: email.trim() || undefined,
        },
        pageUrl: window.location.href,
        screenshotBase64,
        userAgent: navigator.userAgent,
      });

      setConfirmation("Your issue has been sent.");
      setActivity("");
      setIssue("");
      setEmail("");
    } catch (error) {
      console.error("Issue reporting failed", error);
      setConfirmation("Unable to submit issue right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(12, 15, 31, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing.md,
        zIndex: 80,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Report an issue"
    >
      <div
        style={{
          background: tokens.colors.surface,
          width: "min(560px, 100%)",
          borderRadius: tokens.radii.xl,
          boxShadow: tokens.shadows.card,
          padding: tokens.spacing.lg,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.md,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Report an Issue</h2>
          <button style={components.buttons.ghost} onClick={onClose} aria-label="Close issue modal">
            ✕
          </button>
        </div>

        <Input
          aria-label="What were you doing?"
          placeholder="What were you doing?"
          value={activity}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setActivity(event.target.value)}
        />
        <textarea
          aria-label="What went wrong?"
          placeholder="What went wrong?"
          value={issue}
          onChange={(event) => setIssue(event.target.value)}
          style={{
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.radii.lg,
            minHeight: "130px",
            padding: tokens.spacing.md,
            fontFamily: "inherit",
            fontSize: "15px",
          }}
        />
        <Input
          type="email"
          aria-label="Optional email"
          placeholder="Optional email"
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />

        {confirmation ? <p style={components.form.helperText}>{confirmation}</p> : null}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: tokens.spacing.sm }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void submitIssue()} disabled={disabled}>
            {submitting ? "Sending..." : "Send report"}
          </Button>
        </div>
      </div>
    </div>
  );
}
