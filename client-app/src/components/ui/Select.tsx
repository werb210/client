import { useState, type FocusEvent, type CSSProperties } from "react";
import { theme } from "@/styles/theme";

export function Select(props: any) {
  const [focused, setFocused] = useState(false);
  const handleFocus = (event: FocusEvent<HTMLSelectElement>) => {
    setFocused(true);
    props.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLSelectElement>) => {
    setFocused(false);
    props.onBlur?.(event);
  };

  const baseStyle: CSSProperties = {
    width: "100%",
    height: theme.inputs.height,
    padding: theme.inputs.padding,
    borderRadius: theme.inputs.borderRadius,
    border: theme.inputs.border,
    background: theme.inputs.background,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    paddingRight: "44px",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 8l4 4 4-4' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    backgroundSize: "16px",
    boxShadow: focused ? theme.inputs.focusShadow : "none",
    borderColor: focused ? theme.inputs.focusBorderColor : theme.colors.border,
  };

  return (
    <select
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ ...baseStyle, ...props.style }}
    />
  );
}
