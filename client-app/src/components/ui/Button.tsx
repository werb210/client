import {
  useState,
  type CSSProperties,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { theme } from "@/styles/theme";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  style?: CSSProperties;
};

export function Button({
  children,
  variant = "primary",
  style,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const variantStyles = variant === "secondary" ? theme.buttons.secondary : theme.buttons.primary;
  const backgroundColor =
    hovered && !disabled ? variantStyles.hover : variantStyles.background;

  const baseStyle: CSSProperties = {
    height: theme.buttons.height,
    padding: theme.buttons.padding,
    borderRadius: theme.buttons.borderRadius,
    border: variantStyles.border,
    background: backgroundColor,
    color: variantStyles.color,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body.fontSize,
    fontWeight: 600,
    lineHeight: theme.typography.body.lineHeight,
    outline: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "background 0.2s ease, border-color 0.2s ease",
    boxShadow: focused ? theme.inputs.focusShadow : "none",
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => {
        setFocused(true);
        rest.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        rest.onBlur?.(event);
      }}
      className={className}
      style={{ ...baseStyle, ...style }}
    >
      {children}
    </button>
  );
}
