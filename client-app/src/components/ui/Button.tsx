import classNames from "classnames";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export type ButtonVariant = "primary" | "secondary";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    block?: boolean;
  }
>;

export function Button({
  variant = "primary",
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50",
  };

  const widthClass = block ? "w-full" : "";

  return (
    <button
      className={classNames(baseStyles, variantStyles[variant], widthClass, className)}
      {...props}
    >
      {children}
    </button>
  );
}
