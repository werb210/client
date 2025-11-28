import classNames from "classnames";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded font-semibold transition w-full text-center disabled:opacity-60 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={classNames(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </button>
  );
}
