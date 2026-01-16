export const theme = {
  colors: {
    background: "#0B1220",
    surface: "#111827",
    primary: "#2563EB",
    primaryHover: "#1D4ED8",
    textPrimary: "#FFFFFF",
    textSecondary: "#9CA3AF",
    border: "#1F2937",
    danger: "#DC2626",
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    h1: {
      fontSize: "28px",
      fontWeight: 600,
      lineHeight: "1.2",
    },
    h2: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "1.3",
    },
    body: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "1.5",
    },
    label: {
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "1.4",
    },
  },
  inputs: {
    height: "48px",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #1F2937",
    background: "#0F172A",
    focusBorderColor: "#2563EB",
    focusShadow: "0 0 0 2px rgba(37, 99, 235, 0.35)",
  },
  buttons: {
    height: "48px",
    padding: "0 20px",
    borderRadius: "12px",
    primary: {
      background: "#2563EB",
      color: "#FFFFFF",
      hover: "#1D4ED8",
      border: "1px solid #2563EB",
    },
    secondary: {
      background: "transparent",
      color: "#FFFFFF",
      hover: "#1F2937",
      border: "1px solid #1F2937",
    },
  },
  spacing: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  layout: {
    maxWidth: "1100px",
    pagePadding: "32px",
    surfacePadding: "32px",
    radius: "12px",
  },
};
