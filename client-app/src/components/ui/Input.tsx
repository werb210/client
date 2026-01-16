import { useState, type FocusEvent, type CSSProperties } from "react";
import { theme } from "@/styles/theme";

export function Input(props: any) {
  const [focused, setFocused] = useState(false);
  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    props.onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
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
    boxShadow: focused ? theme.inputs.focusShadow : "none",
    borderColor: focused ? theme.inputs.focusBorderColor : theme.colors.border,
  };

  return (
    <input
      {...props}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ ...baseStyle, ...props.style }}
    />
  );
}
