import type { InputHTMLAttributes } from "react";
import { components } from "@/styles";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  checked?: boolean;
};

export function Checkbox({ checked, style, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      style={{
        ...components.checkbox.base,
        ...(checked ? components.checkbox.checked : null),
        ...style,
      }}
      {...props}
    />
  );
}
