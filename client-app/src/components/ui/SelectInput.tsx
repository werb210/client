import classNames from "classnames";
import type { SelectHTMLAttributes } from "react";

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  error?: string;
};

export function SelectInput({
  label,
  className,
  options,
  error,
  children,
  ...props
}: SelectInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-gray-900">
      <span>{label}</span>
      <select
        className={classNames(
          "rounded-lg border px-3 py-2 text-base font-normal text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        {...props}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        {children}
      </select>
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
