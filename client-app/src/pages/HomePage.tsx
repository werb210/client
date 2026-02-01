import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { CookieBanner } from "../components/CookieBanner";
import { Card } from "../components/ui/Card";
import { components, layout, tokens } from "@/styles";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={layout.page}>
      <section
        style={{
          maxWidth: "var(--portal-max-width)",
          margin: "0 auto",
          display: "grid",
          gap: tokens.spacing.xl,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
          <div style={components.form.eyebrow}>Boreal Financial</div>
          <h1 style={components.form.title}>Funding that keeps your business moving.</h1>
          <p style={components.form.subtitle}>
            Complete your application in minutes with a secure SMS magic-link
            that lets you pick up right where you left off.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: tokens.spacing.sm }}>
            <Button style={{ padding: "0 32px" }} onClick={() => navigate("/apply/step-1")}>
              Start Your Application
            </Button>
          </div>
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
            <div style={components.form.eyebrow}>What to expect</div>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
              {[
                "Answer a few questions about your business and funding needs.",
                "Review the product category that best matches your profile.",
                "Upload required documents or request a secure upload link.",
              ].map((text, index) => (
                <div key={text} style={{ display: "flex", gap: tokens.spacing.sm }}>
                  <div
                    style={{
                      height: "32px",
                      width: "32px",
                      borderRadius: tokens.radii.pill,
                      background: tokens.colors.primaryLight,
                      color: tokens.colors.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={components.form.subtitle}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>
      <CookieBanner />
    </div>
  );
}
