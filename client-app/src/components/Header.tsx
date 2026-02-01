import { tokens } from "@/styles";

export function Header() {
  return (
    <header
      style={{
        background: tokens.colors.primary,
        color: tokens.colors.surface,
        padding: `0 var(--page-padding)`,
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: tokens.shadows.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
        <div
          style={{
            height: "36px",
            width: "36px",
            borderRadius: tokens.radii.pill,
            background: "rgba(255, 255, 255, 0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          BF
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            Boreal
          </div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Financial</div>
        </div>
      </div>
    </header>
  );
}
