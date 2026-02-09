import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/Button";
import { components, layout } from "@/styles";

export function SessionRevokedPage() {
  const navigate = useNavigate();

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={layout.stackTight}>
            <h1 style={components.form.sectionTitle}>Access revoked</h1>
            <p style={components.form.subtitle}>
              This access link is no longer valid. Please verify your phone
              number again to continue.
            </p>
            <PrimaryButton
              style={{ width: "100%" }}
              onClick={() => navigate("/portal", { replace: true })}
            >
              Verify phone
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

