import {
  useState,
  type CSSProperties,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { components, tokens } from "@/styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  style?: CSSProperties;
};

export function Button({
  children,
  variant = "primary",
  style,
  className = "",
  disabled,
  loading,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: components.buttons.primary,
    secondary: components.buttons.secondary,
    ghost: components.buttons.ghost,
  }[variant];

  const backgroundColor =
    hovered && !isDisabled && variant === "primary"
      ? tokens.colors.primaryDark
      : hovered && !isDisabled && variant === "secondary"
      ? tokens.colors.primaryLight
      : hovered && !isDisabled && variant === "ghost"
      ? "rgba(11, 42, 74, 0.08)"
      : variantStyles.background;

  const baseStyle: CSSProperties = {
    ...components.buttons.base,
    ...variantStyles,
    background: backgroundColor,
    opacity: isDisabled ? 0.7 : 1,
    ...(isDisabled ? components.buttons.disabled : null),
    ...(focused ? components.buttons.focus : null),
  };

  return (
    <button
      {...rest}
      disabled={isDisabled}
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
      {loading ? (
        <span
          style={
            variant === "secondary" || variant === "ghost"
              ? components.buttons.spinnerDark
              : components.buttons.spinner
          }
        />
      ) : null}
      <span style={{ opacity: loading ? 0.75 : 1 }}>{children}</span>
    </button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <Button {...props} variant="secondary" />;
}

export function GhostButton(props: ButtonProps) {
  return <Button {...props} variant="ghost" />;
}
