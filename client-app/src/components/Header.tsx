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
          <img
            src="/icons/icon-192x192.png"
            alt="Boreal Financial"
            className="h-10 w-auto object-contain"
          />
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
