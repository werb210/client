import {
  useState,
  type CSSProperties,
  type SelectHTMLAttributes,
} from "react";
import { components } from "@/styles";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  style?: CSSProperties;
  hasError?: boolean;
};

export function Select({
  style,
  className = "",
  disabled,
  hasError,
  ...props
}: SelectProps) {
  const [focused, setFocused] = useState(false);

  const baseStyle: CSSProperties = {
    ...components.inputs.base,
    ...(focused ? components.inputs.focused : null),
    ...(hasError ? components.inputs.error : null),
    ...(disabled ? components.inputs.disabled : null),
  };

  return (
    <select
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
