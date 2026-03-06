import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { components, layout, tokens } from "@/styles";

export function ComingSoon(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div style={layout.page}>
      <div style={layout.centerColumn}>
        <Card>
          <div style={layout.stackTight}>
            <h1 style={components.form.title}>Feature Coming Soon</h1>
            <p style={components.form.subtitle}>
              This feature will be available in an upcoming update.
            </p>
            <button type="button" style={{ ...components.buttons.base, ...components.buttons.secondary }} onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="button" style={{ ...components.buttons.base, ...components.buttons.secondary }} onClick={() => navigate("/status") }>
              Message Staff
            </button>
            <button type="button" style={{ ...components.buttons.base, ...components.buttons.primary, marginTop: tokens.spacing.xs }} onClick={() => window.location.assign("tel:+18005551212")}>
              Call Us
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ComingSoon;
