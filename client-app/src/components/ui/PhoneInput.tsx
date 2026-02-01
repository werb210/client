import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";

type PhoneInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function PhoneInput({ hasError, ...props }: PhoneInputProps) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      hasError={hasError}
      {...props}
    />
  );
}
