import classNames from "classnames";
import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ label, className, error, ...props }: TextInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-900">
      <span>{label}</span>
      <input
        className={classNames(
          "rounded-lg border px-3 py-2 text-base font-normal text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
