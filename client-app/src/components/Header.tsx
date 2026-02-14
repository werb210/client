import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/styles";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const inApplicationFlow =
    location.pathname.startsWith("/apply") ||
    location.pathname.startsWith("/application");

  return (
    <header
      style={{
        background: tokens.colors.surface,
        borderBottom: `1px solid ${tokens.colors.border}`,
        padding: `0 var(--page-padding)`,
        minHeight: "80px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--portal-max-width)",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: tokens.spacing.md,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
          <div
            style={{
              height: "48px",
              width: "48px",
              borderRadius: tokens.radii.pill,
              background: tokens.colors.primary,
              color: tokens.colors.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            BF
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: tokens.colors.textSecondary,
              }}
            >
              Boreal
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: tokens.colors.textPrimary }}>
              Financial
            </div>
          </div>
        </div>

        {!inApplicationFlow && (
          <Button style={{ padding: "0 28px" }} onClick={() => navigate("/apply/step-1")}>
            Learn More
          </Button>
        )}
      </div>
    </header>
  );
}
