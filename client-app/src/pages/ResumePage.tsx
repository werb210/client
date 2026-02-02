import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResumeApplication } from "../hooks/useResumeApplication";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { components, layout, tokens } from "@/styles";

export function ResumePage() {
  const { resume } = useResumeApplication();
  const [info, setInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    resume().then(setInfo);
  }, [resume]);

  useEffect(() => {
    if (info?.submitted) {
      navigate("/portal", { replace: true });
    }
  }, [info, navigate]);

  if (!info) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <div style={layout.stackTight}>
              <h1 style={components.form.sectionTitle}>No saved applications found</h1>
              <p style={components.form.subtitle}>Start a new application to begin.</p>
              <Button
                style={{ width: "100%", maxWidth: "260px" }}
                onClick={() => navigate("/apply/step-1")}
              >
                Start new application
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (info.submitted) {
    return (
      <div style={layout.page}>
        <div style={layout.centerColumn}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
              <Spinner />
              <div style={components.form.helperText}>
                Redirecting to your portal…
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
            <div style={components.form.eyebrow}>Resume</div>
            <h1 style={components.form.title}>Continue your application</h1>
            <p style={components.form.subtitle}>
              We saved your progress. Continue where you left off.
            </p>
            {info?.offline && (
              <div style={components.form.helperText}>
                You're offline. We'll sync as soon as you reconnect.
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
              <Button
                style={{ width: "100%", maxWidth: "260px" }}
                onClick={() => navigate("/apply/step-1")}
              >
                Continue application
              </Button>
              <Button
                variant="secondary"
                style={{ width: "100%", maxWidth: "260px" }}
                onClick={() => navigate("/portal")}
              >
                View client portal
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
