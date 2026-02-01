import {
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
} from "react";
import { components } from "@/styles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  style?: CSSProperties;
  hasError?: boolean;
};

export function Input({
  style,
  className = "",
  disabled,
  hasError,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const baseStyle: CSSProperties = {
    ...components.inputs.base,
    ...(focused ? components.inputs.focused : null),
    ...(hasError ? components.inputs.error : null),
    ...(disabled ? components.inputs.disabled : null),
  };

  return (
    <input
      {...props}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      onFocus={(event) => {
        setFocused(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        props.onBlur?.(event);
      }}
      className={className}
      style={{ ...baseStyle, ...style }}
    />
  );
}
